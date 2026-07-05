import os
import re
import shutil
import tempfile
from pathlib import Path
from typing import Literal


from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from starlette.background import BackgroundTask
from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError


app = FastAPI(title="Lychee Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MediaRequest(BaseModel):
    url: str
    format: Literal["mp3", "mp4"] = "mp4"
    quality: str = "best"


def is_probably_youtube_url(url: str) -> bool:
    lowered = url.strip().lower()
    return (
        lowered.startswith("http://")
        or lowered.startswith("https://")
    ) and (
        "youtube.com" in lowered
        or "youtu.be" in lowered
        or "music.youtube.com" in lowered
    )


def safe_filename(name: str, fallback: str = "lychee") -> str:
    name = re.sub(r'[\\/:*?"<>|\x00-\x1f]', "_", name).strip()
    name = re.sub(r"\s+", " ", name)
    return name[:180] if name else fallback


def cleanup_path(path: str) -> None:
    shutil.rmtree(path, ignore_errors=True)


def mp4_format_selector(quality: str) -> str:
    q = quality.strip().lower()

    mapping = {
        "best": "bv*+ba/b",
        "2160p": "bv*[height<=2160]+ba/b[height<=2160]",
        "1440p": "bv*[height<=1440]+ba/b[height<=1440]",
        "1080p": "bv*[height<=1080]+ba/b[height<=1080]",
        "720p": "bv*[height<=720]+ba/b[height<=720]",
        "480p": "bv*[height<=480]+ba/b[height<=480]",
        "360p": "bv*[height<=360]+ba/b[height<=360]",
    }

    return mapping.get(q, "bv*+ba/b")


def pick_final_file(workdir: str, expected_ext: Literal["mp3", "mp4"]) -> Path:
    root = Path(workdir)
    candidates = [
        p for p in root.rglob("*")
        if p.is_file() and p.suffix.lower() == f".{expected_ext}"
    ]

    if not candidates:
        candidates = [
            p for p in root.rglob("*")
            if p.is_file()
            and not p.name.endswith(".part")
            and not p.name.endswith(".ytdl")
            and not p.name.endswith(".json")
        ]

    if not candidates:
        raise HTTPException(status_code=500, detail="Download finished, but no output file was found.")

    return max(candidates, key=lambda p: p.stat().st_mtime)


def extract_info(url: str) -> dict:
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)
    except DownloadError as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read media info: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid or unsupported URL: {exc}") from exc


@app.get("/")
def root():
    return {
        "ok": True,
        "name": "Lychee Backend",
        "endpoints": ["/health", "/info", "/download"],
    }


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/info")
def info(url: str = Query(..., description="YouTube URL")):
    if not is_probably_youtube_url(url):
        raise HTTPException(status_code=400, detail="Please provide a valid YouTube URL.")

    data = extract_info(url)

    formats = []
    for f in data.get("formats", [])[:25]:
        formats.append(
            {
                "format_id": f.get("format_id"),
                "ext": f.get("ext"),
                "resolution": f.get("resolution"),
                "height": f.get("height"),
                "fps": f.get("fps"),
                "abr": f.get("abr"),
                "vcodec": f.get("vcodec"),
                "acodec": f.get("acodec"),
                "filesize": f.get("filesize") or f.get("filesize_approx"),
            }
        )

    return {
        "title": data.get("title"),
        "uploader": data.get("uploader"),
        "duration": data.get("duration"),
        "thumbnail": data.get("thumbnail"),
        "webpage_url": data.get("webpage_url"),
        "formats": formats,
    }


@app.api_route("/download", methods=["GET", "POST"])
def download(
    url: str | None = Query(None, description="YouTube URL"),
):
    """
    Direct browser download endpoint.

    Use it like:
    /download?url=https://www.youtube.com/watch?v=xxxx&format=mp4&quality=720p

    Query params supported:
    - url
    - format=mp3|mp4
    - quality=best|2160p|1440p|1080p|720p|480p|360p for mp4
    - quality=128|192|320 for mp3
    """
    raise HTTPException(
        status_code=405,
        detail="Use POST /download with JSON body or GET /download with query params.",
    )


@app.post("/download")
def download_post(payload: MediaRequest):
    return _download_impl(payload.url, payload.format, payload.quality)


@app.get("/download/file")
def download_get(
    url: str = Query(..., description="YouTube URL"),
    format: Literal["mp3", "mp4"] = Query("mp4"),
    quality: str = Query("best"),
):
    return _download_impl(url, format, quality)


def _download_impl(url: str, output_format: Literal["mp3", "mp4"], quality: str):
    if not is_probably_youtube_url(url):
        raise HTTPException(status_code=400, detail="Please provide a valid YouTube URL.")

    workdir = tempfile.mkdtemp(prefix="lychee_")

    try:
        if output_format == "mp4":
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "noplaylist": True,
                "outtmpl": os.path.join(workdir, "%(title).200s [%(id)s].%(ext)s"),
                "format": mp4_format_selector(quality),
                "merge_output_format": "mp4",
                "restrictfilenames": False,
                "windowsfilenames": True,
            }
        else:
            mp3_quality = quality.strip() if quality.strip().isdigit() else "192"
            ydl_opts = {
                "quiet": True,
                "no_warnings": True,
                "noplaylist": True,
                "outtmpl": os.path.join(workdir, "%(title).200s [%(id)s].%(ext)s"),
                "format": "bestaudio/best",
                "postprocessors": [
                    {
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                        "preferredquality": mp3_quality,
                    }
                ],
                "restrictfilenames": False,
                "windowsfilenames": True,
            }

        try:
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
        except DownloadError as exc:
            cleanup_path(workdir)
            raise HTTPException(status_code=400, detail=f"Download failed: {exc}") from exc
        except Exception as exc:
            cleanup_path(workdir)
            raise HTTPException(status_code=500, detail=f"Something went wrong: {exc}") from exc

        final_file = pick_final_file(workdir, output_format)
        title = safe_filename(info.get("title", "lychee_download"))
        filename = f"{title}.{output_format}"

        media_type = "audio/mpeg" if output_format == "mp3" else "video/mp4"

        return FileResponse(
            path=str(final_file),
            filename=filename,
            media_type=media_type,
            background=BackgroundTask(cleanup_path, workdir),
        )

    except HTTPException:
        raise
    except Exception as exc:
        cleanup_path(workdir)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
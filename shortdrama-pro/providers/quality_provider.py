"""Quality Provider — 质检和自动修复"""

from pathlib import Path


class QualityProvider:
    def __init__(self):
        pass

    def inspect_shot(self, shot: dict) -> dict:
        """检查单个镜头"""
        issues = []
        if not shot.get("dialogue"):
            issues.append("缺对白")
        if not shot.get("scene"):
            issues.append("缺场景描述")
        if shot.get("duration", 6) < 2:
            issues.append("时长过短")
        return {"pass": len(issues) == 0, "issues": issues}

    def inspect_video(self, video_path: str) -> dict:
        """检查输出视频文件"""
        video = Path(video_path)
        if not video.exists():
            return {"pass": False, "retry_shots": [], "error": "视频文件不存在"}
        size_mb = video.stat().st_size / (1024 * 1024)
        if size_mb < 0.1:
            return {"pass": False, "retry_shots": [], "error": f"视频过小 ({size_mb:.2f} MB)"}
        return {"pass": True, "retry_shots": [], "size_mb": round(size_mb, 2)}

    def validate_story(self, story: dict) -> dict:
        """验证故事结构"""
        required = ["title", "genre", "theme"]
        missing = [k for k in required if not story.get(k)]
        return {"valid": len(missing) == 0, "missing_fields": missing}

    def validate_shots(self, shots: list) -> dict:
        """验证分镜结构"""
        issues = []
        for s in shots:
            for k in ["shot_id", "duration", "scene", "dialogue"]:
                if not s.get(k):
                    issues.append(f"镜头 {s.get('shot_id', '?')}: 缺 {k}")
        return {"valid": len(issues) == 0, "issues": issues}

"""质检引擎 — 检查镜头质量并标记需要重跑的镜头"""

import json
from pathlib import Path
from datetime import datetime

OUTPUT_DIR = Path(__file__).parent.parent / "output"


class QAEngine:
    def __init__(self, mode="local"):
        self.mode = mode

    def inspect(self, video_path: str, rendered_shots: list) -> dict:
        """检查最终视频和镜头质量"""
        issues = []
        retry_shots = []

        video = Path(video_path)
        if not video.exists():
            issues.append("最终视频文件不存在")
        elif video.stat().st_size < 1000:
            issues.append(f"视频文件过小: {video.stat().st_size} bytes")
            retry_shots.append("all")

        for shot in rendered_shots:
            shot_id = shot.get("shot_id", "?")
            frame = Path(shot.get("frame_path", ""))
            audio = Path(shot.get("audio_path", ""))

            if not frame.exists():
                issues.append(f"镜头 {shot_id}: 缺帧")
                retry_shots.append(shot_id)
            if not audio.exists():
                issues.append(f"镜头 {shot_id}: 缺音频")

        # 生成报告
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_shots": len(rendered_shots),
            "issues_count": len(issues),
            "issues": issues,
            "retry_shots": retry_shots,
            "verdict": "PASS" if len(issues) == 0 else "RETRY" if retry_shots else "WARN",
        }

        report_path = OUTPUT_DIR / "report.md"
        report_path.write_text(self._format_report(report), encoding="utf-8")
        print(f"  [QAEngine] 报告 → {report_path} ({report['verdict']})")

        return {"retry_shots": retry_shots, "report_path": str(report_path), "report": report}

    @staticmethod
    def _format_report(report: dict) -> str:
        lines = [
            "# 短剧生产报告",
            "",
            f"- 时间: {report['timestamp']}",
            f"- 镜头总数: {report['total_shots']}",
            f"- 问题数: {report['issues_count']}",
            f"- 判定: **{report['verdict']}**",
            "",
            "## 问题详情",
        ]
        if report["issues"]:
            for i in report["issues"]:
                lines.append(f"- {i}")
        else:
            lines.append("- 无问题，所有镜头通过质检。")
        return "\n".join(lines)

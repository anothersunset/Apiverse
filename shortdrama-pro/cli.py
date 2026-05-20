import argparse
from pipeline import ShortDramaPipeline

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--idea", required=True, help="一句话短剧创意或小说片段")
    parser.add_argument("--mode", default="local", choices=["local", "hybrid", "production"])
    parser.add_argument("--duration", type=int, default=60)
    args = parser.parse_args()

    pipeline = ShortDramaPipeline(mode=args.mode)
    result = pipeline.run(
        idea=args.idea,
        target_duration=args.duration,
    )

    print("生成完成：", result["final_video"])
    print("验收报告：", result["report"])

if __name__ == "__main__":
    main()

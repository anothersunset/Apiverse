FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    ffmpeg \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p assets/frames assets/voices output data

# 默认生成一个示例短剧；可通过环境变量覆盖
ENV STORY_IDEA="一个关于友情的温暖故事"
ENV MODE="local"
ENV DURATION="30"

CMD python cli.py --idea "$STORY_IDEA" --mode "$MODE" --duration "$DURATION"

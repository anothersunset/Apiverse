"""Prompt 模板 — 用于 LLM 生成故事、角色和分镜"""

STORY_PROMPT = """你是一个专业短剧编剧。根据用户的一句话创意，生成完整的短剧故事。

输入创意：{idea}
目标时长：{target_duration} 秒

请输出 JSON（不要包含其他内容）：
{{
  "title": "短剧标题（10字以内）",
  "genre": "风格类型（如：现代都市、古装、悬疑等）",
  "theme": "核心主题",
  "logline": "一句话故事梗概（30字以内）",
  "episodes": 1,
  "target_duration_seconds": {target_duration}
}}
"""

CHARACTER_PROMPT = """你是角色设计师。根据短剧故事，为每个角色创建设定。

故事：{story_json}

请输出 JSON 数组（不要包含其他内容）：
[
  {{
    "id": "char_1",
    "name": "角色名（中文，2-3字）",
    "role": "角色定位（如：女主、男主、反派）",
    "visual_prompt": "角色外观描述（英文，用于AI图像生成）",
    "negative_prompt": "需要避免的特征",
    "voice": "zh-CN-XiaoxiaoNeural"
  }}
]

要求：2-4个角色，每个角色要有鲜明的外观差异。
"""

SHOT_PROMPT = """你是分镜师。根据故事和角色，设计镜头序列。

故事：{story_json}
角色：{characters_json}
目标镜头数：{shot_count}

请输出 JSON 数组（不要包含其他内容）：
[
  {{
    "shot_id": "s01",
    "duration": 6,
    "scene": "场景描述",
    "character": "镜头中的角色名",
    "camera": "镜头语言（中景/近景/特写/远景）",
    "action": "角色动作描述",
    "dialogue": "角色对白",
    "image_prompt": "画面英文描述",
    "video_prompt": "视频动态英文描述"
  }}
]

要求：{shot_count} 个镜头，有起承转合，每个镜头有明确的对白和情感变化。
"""

LOCAL_STORY_TEMPLATES = [
    {
        "title": "最后一分钟的告白",
        "genre": "现代都市短剧",
        "theme": "坚持、信任、逆转",
        "logline": "创业濒临失败，两个合伙人在最后一次测试中找回信任。",
        "characters": [
            {"id": "lin_xia", "name": "林夏", "role": "女主，年轻创业者", "visual": "黑色短发，白色风衣，神情倔强", "voice": "zh-CN-XiaoxiaoNeural"},
            {"id": "chen_yu", "name": "陈屿", "role": "男主，沉默的技术合伙人", "visual": "深蓝衬衫，眼神克制", "voice": "zh-CN-YunxiNeural"}
        ],
        "shots": [
            {"id": "s01", "duration": 6, "scene": "雨夜，公司楼下", "character": "林夏", "camera": "中景，缓慢推近",
             "action": "林夏抱着文件站在雨里，看着楼上的灯一盏盏熄灭",
             "dialogue": "他们都走了，连你也要放弃这个项目吗？",
             "image_prompt": "rainy night office building, young founder in white trench coat",
             "video_prompt": "slow push in, rain falling, emotional drama"},
            {"id": "s02", "duration": 7, "scene": "空荡办公室", "character": "陈屿", "camera": "近景，侧脸，屏幕冷光",
             "action": "陈屿看着电脑上即将完成的模型训练进度条",
             "dialogue": "我不是放弃，我是在等最后一次结果。",
             "image_prompt": "empty office, programmer at computer, blue shirt",
             "video_prompt": "static shot, screen glow, tension"},
            {"id": "s03", "duration": 7, "scene": "办公室门口", "character": "林夏", "camera": "手持镜头",
             "action": "林夏推门而入，发现桌上贴满了项目失败原因和修复方案",
             "dialogue": "这些……你一个人做了多久？",
             "image_prompt": "office door, notes on wall, woman surprised",
             "video_prompt": "handheld camera, door opening, reveal"},
            {"id": "s04", "duration": 8, "scene": "电脑屏幕前", "character": "陈屿", "camera": "特写，进度条跳到100%",
             "action": "模型测试通过，屏幕弹出成功提示",
             "dialogue": "从你说还想再试一次的那天开始。",
             "image_prompt": "computer screen, progress bar 100 percent, success",
             "video_prompt": "close up screen, progress bar completes, relief"},
            {"id": "s05", "duration": 9, "scene": "清晨天台", "character": "林夏与陈屿", "camera": "远景，日出逆光",
             "action": "两人站在天台，看着城市天亮，手机收到投资人回复",
             "dialogue": "这一次，我们不是等机会来，是亲手把它做出来。",
             "image_prompt": "rooftop sunrise, city skyline, two silhouettes",
             "video_prompt": "wide shot, sunrise, hope, cinematic"}
        ]
    },
    {
        "title": "深夜食堂的陌生人",
        "genre": "温情都市短剧",
        "theme": "陌生人的善意",
        "logline": "深夜食堂里，几个孤独的人因一碗面而彼此温暖。",
        "characters": [
            {"id": "chef", "name": "老周", "role": "食堂老板", "visual": "白发围裙，手上有烫伤疤痕", "voice": "zh-CN-YunxiNeural"},
            {"id": "girl", "name": "小晚", "role": "加班白领", "visual": "疲惫妆容，职业套装", "voice": "zh-CN-XiaoxiaoNeural"}
        ],
        "shots": [
            {"id": "s01", "duration": 6, "scene": "深夜食堂内", "character": "老周", "camera": "中景",
             "action": "老周擦拭台面，看墙上时钟已过凌晨",
             "dialogue": "这个点还来的，都是有故事的人。",
             "image_prompt": "late night diner, chef wiping counter, cozy warm light",
             "video_prompt": "slow pan, warm interior, quiet atmosphere"},
            {"id": "s02", "duration": 6, "scene": "食堂门口", "character": "小晚", "camera": "中景",
             "action": "小晚推门进来，疲惫地坐下",
             "dialogue": "老板，一碗阳春面，少放盐。",
             "image_prompt": "woman entering late night diner, tired face, business suit",
             "video_prompt": "door opens, woman walks in, tired expression"},
            {"id": "s03", "duration": 8, "scene": "厨房", "character": "老周", "camera": "特写",
             "action": "老周默默多加了一个荷包蛋",
             "dialogue": "（旁白）加班的姑娘，该多吃点。",
             "image_prompt": "chef cooking noodles, adding extra egg, caring hands",
             "video_prompt": "close up cooking, steam rising, egg being added"},
            {"id": "s04", "duration": 7, "scene": "餐桌前", "character": "小晚", "camera": "近景",
             "action": "小晚看到碗底的荷包蛋，眼泪掉下来",
             "dialogue": "谢谢……今天是我生日，我以为没人记得。",
             "image_prompt": "woman crying while eating, bowl of noodles, emotional",
             "video_prompt": "close up, tears falling, warm lighting"},
            {"id": "s05", "duration": 9, "scene": "食堂全貌", "character": "老周与小晚", "camera": "远景",
             "action": "老周端出一个小蛋糕，食堂里仅有的两个客人一起为小晚唱生日歌",
             "dialogue": "在这座城市里，没有人是一座孤岛。",
             "image_prompt": "diner scene, small birthday cake, strangers celebrating",
             "video_prompt": "wide shot, candlelight, warm smiles, hopeful"}
        ]
    }
]

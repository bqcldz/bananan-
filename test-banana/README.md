# 胜算云API测试脚本

这个脚本用于测试胜算云的图片生成和编辑API功能。

## 功能特性

- 📸 **图片生成**: 根据文本提示词生成新图片
- ✏️ **图片编辑**: 编辑现有图片（支持人像.jpg等格式）
- 💾 **自动保存**: 生成和编辑的图片自动保存到当前目录
- 📊 **详细输出**: 显示API响应、使用统计和修改建议
- 🎨 **智能提示**: 内置专业的System Prompt，获得更好的结果

## 使用方法

### 1. 设置API Key
编辑 `test-banana-api.js` 文件，将 `API_KEY` 替换为你的实际API Key：
```javascript
const API_KEY = 'your_actual_api_key_here';
```

### 2. 运行脚本
```bash
node test-banana-api.js
```

或者使用npm:
```bash
npm start
```

## API接口说明

### 图像生成接口
- **端点**: `POST /v1/images/generations`
- **参数**: 
  - `prompt`: 生成图像的提示词
  - `model`: 模型名称（默认: google/gemini-2.5-flash-image-preview）

### 图像编辑接口
- **端点**: `POST /v1/images/edits`
- **参数**:
  - `prompt`: 编辑图像的提示词
  - `images`: 参考图像数组（base64编码）
  - `model`: 模型名称（默认: google/gemini-2.5-flash-image-preview）

## 输出文件

生成的图片会自动保存为：
- `generated_image_candidate1_part1.png` (生成的图片)
- `edited_image_candidate1_part1.png` (编辑后的图片)

## System Prompt

脚本内置了专业的System Prompt，确保：
- 高质量的图像结果
- 详细的修改建议和说明
- 图像特点和改进方向的解释
- 具体修改内容的说明

## 注意事项

- 确保 `人像.jpg` 文件存在于同一目录下
- API Key需要有效且有足够的配额
- 生成的图片格式支持PNG和JPEG
- 脚本会自动处理多个候选结果

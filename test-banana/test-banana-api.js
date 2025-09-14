import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const API_BASE_URL = 'https://router.shengsuanyun.com/api';
const API_KEY = 'YOUR_API_KEY_HERE'; // 请替换为实际的API Key
const MODEL = 'google/gemini-2.5-flash-image-preview';

// System Prompt设计
const SYSTEM_PROMPT = `你是一个专业的AI图像生成和编辑助手。请根据用户的要求生成或编辑图像，并在输出中：
1. 提供高质量的图像结果
2. 给出详细的修改建议和说明
3. 解释图像的特点和改进方向
4. 如果是编辑任务，请说明具体做了哪些修改

请确保生成的图像质量高，符合用户需求，并提供有价值的建议。`;

/**
 * 发送API请求
 */
async function sendAPIRequest(endpoint, requestBody) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

/**
 * 包装用户提示词
 */
function wrapPrompt(userPrompt) {
    return `${SYSTEM_PROMPT}\n\n用户要求：${userPrompt}`;
}

/**
 * 将图片转换为base64
 */
function imageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64String = imageBuffer.toString('base64');
        return base64String;
    } catch (error) {
        console.error('读取图片失败:', error);
        throw error;
    }
}

/**
 * 保存base64图片到文件
 */
function saveBase64Image(base64Data, filename, mimeType = 'image/png') {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const extension = mimeType.includes('jpeg') ? 'jpg' : 'png';
        const filepath = path.join(__dirname, `${filename}.${extension}`);
        
        fs.writeFileSync(filepath, buffer);
        console.log(`图片已保存到: ${filepath}`);
        return filepath;
    } catch (error) {
        console.error('保存图片失败:', error);
        throw error;
    }
}

/**
 * 处理API响应并保存图片
 */
function processAPIResponse(response, baseFilename) {
    if (!response.candidates || response.candidates.length === 0) {
        console.log('没有返回候选结果');
        return;
    }

    console.log(`\n收到 ${response.candidates.length} 个候选结果:`);
    
    response.candidates.forEach((candidate, index) => {
        const content = candidate.content;
        if (!content || !content.parts) return;

        console.log(`\n--- 候选结果 ${index + 1} ---`);
        
        content.parts.forEach((part, partIndex) => {
            if (part.text) {
                console.log('文本描述:', part.text);
            }
            
            if (part.inlineData && part.inlineData.data) {
                const filename = `${baseFilename}_candidate${index + 1}_part${partIndex + 1}`;
                const savedPath = saveBase64Image(
                    part.inlineData.data, 
                    filename, 
                    part.inlineData.mimeType
                );
                console.log(`图片保存成功: ${savedPath}`);
            }
        });
    });

    // 打印使用统计
    if (response.usageMetadata) {
        console.log('\n--- 使用统计 ---');
        console.log(`提示词tokens: ${response.usageMetadata.promptTokenCount}`);
        console.log(`响应tokens: ${response.usageMetadata.candidatesTokenCount}`);
        console.log(`总tokens: ${response.usageMetadata.totalTokenCount}`);
    }
}

/**
 * 生成图片
 */
async function generateImage(prompt) {
    console.log('\n=== 开始生成图片 ===');
    console.log('提示词:', prompt);
    
    const requestBody = {
        prompt: wrapPrompt(prompt),
        model: MODEL
    };

    try {
        const response = await sendAPIRequest('/v1/images/generations', requestBody);
        processAPIResponse(response, 'generated_image');
    } catch (error) {
        console.error('图片生成失败:', error);
    }
}

/**
 * 编辑图片
 */
async function editImage(prompt, imagePath) {
    console.log('\n=== 开始编辑图片 ===');
    console.log('编辑提示词:', prompt);
    console.log('原始图片路径:', imagePath);
    
    // 检查图片文件是否存在
    if (!fs.existsSync(imagePath)) {
        console.error('图片文件不存在:', imagePath);
        return;
    }

    try {
        const base64Image = imageToBase64(imagePath);
        
        const requestBody = {
            prompt: wrapPrompt(prompt),
            images: [base64Image],
            model: MODEL
        };

        const response = await sendAPIRequest('/v1/images/edits', requestBody);
        processAPIResponse(response, 'edited_image');
    } catch (error) {
        console.error('图片编辑失败:', error);
    }
}

/**
 * 主测试函数
 */
async function main() {
    console.log('='.repeat(50));
    console.log('胜算云API图片生成和编辑测试');
    console.log('='.repeat(50));
    
    // 检查API Key
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('请先设置正确的API Key!');
        console.log('请修改脚本中的 API_KEY 变量');
        return;
    }

    try {
        // 测试1: 生成图片
        await generateImage('一只可爱的橙色小猫坐在樱花树下，阳光透过花瓣洒在猫咪身上，画面温馨美好');
        
        // 等待一段时间再进行下一个测试
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 测试2: 编辑现有图片
        const imagePath = path.join(__dirname, '人像.jpg');
        await editImage('请将这张人像照片转换成卡通风格，保持人物的基本特征，但要有动漫的效果，背景改为梦幻的粉色渐变', imagePath);
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

// 导出函数供其他模块使用
export { generateImage, editImage, imageToBase64, saveBase64Image };

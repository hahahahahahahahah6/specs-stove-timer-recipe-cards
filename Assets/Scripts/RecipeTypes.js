"use strict";
// RecipeTypes.ts - Data structures and storage for Recipe Step Cards & Stove Timer
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUNDLED_SAMPLE_JSON_LD = exports.DEFAULT_RECIPE = void 0;
exports.extractTimerFromText = extractTimerFromText;
exports.parseRecipeJsonLd = parseRecipeJsonLd;
// Default hackathon recipe: 番茄意大利面 Spaghetti with Tomato Sauce (2人份)
exports.DEFAULT_RECIPE = {
    id: "spaghetti-tomato-default",
    title: "番茄意大利面 Spaghetti with Tomato Sauce",
    servings: 2,
    source: "https://www.allrecipes.com/recipe/11890/quick-tomato-sauce/",
    ingredients: [
        { name: "意大利面 (Spaghetti)", amount: 200, unit: "g" },
        { name: "番茄碎罐头 (Crushed Tomatoes)", amount: 400, unit: "g (1罐)" },
        { name: "大蒜 (Garlic)", amount: 3, unit: "瓣" },
        { name: "橄榄油 (Olive Oil)", amount: 2, unit: "汤匙" },
        { name: "盐 (煮面水 1 汤匙，酱汁 1/2 茶匙)", amount: 1.5, unit: "汤匙" },
        { name: "黑胡椒 (Black Pepper)", amount: 1, unit: "少许" },
        { name: "新鲜罗勒 (Fresh Basil)", amount: 6, unit: "片" },
        { name: "帕玛森奶酪 (Parmesan)", amount: 20, unit: "g" },
        { name: "清水 (Water)", amount: 3, unit: "L" }
    ],
    steps: [
        {
            order: 1,
            text: "烧水：大锅加 3 L 水，大火煮沸后加 1 汤匙盐（准备煮面）",
            timerSeconds: null,
            timerLabel: "烧水",
            burner: "right"
        },
        {
            order: 2,
            text: "爆香蒜片：大蒜切片。平底锅开中火，倒入橄榄油，放入蒜片炒到微微金黄",
            timerSeconds: 120, // 2分钟
            timerLabel: "爆香蒜片 (Garlic)",
            burner: "left"
        },
        {
            order: 3,
            text: "煮酱：倒入番茄碎，加盐和黑胡椒，转小火慢炖（与煮面同时进行）",
            timerSeconds: 600, // 10分钟
            timerLabel: "慢炖番茄酱 (Sauce)",
            burner: "left"
        },
        {
            order: 4,
            text: "煮面：酱开始炖的同时，把面放进沸水里煮（与步骤3并行，双灶齐下）",
            timerSeconds: 540, // 9分钟
            timerLabel: "沸水煮意面 (Pasta)",
            burner: "right"
        },
        {
            order: 5,
            text: "拌面：先留半杯煮面水，再把面沥干，倒进酱锅里翻拌。太干就加一点面水",
            timerSeconds: 60, // 1分钟
            timerLabel: "酱锅拌面 (Toss)",
            burner: "left"
        },
        {
            order: 6,
            text: "装盘：盛入面盘，撒上撕碎的鲜罗勒叶和现擦帕玛森奶酪即可享用",
            timerSeconds: null,
            timerLabel: "出锅装盘",
            burner: "center"
        }
    ],
    updatedAt: Date.now()
};
// Timer text parser (Regex extraction from step instruction)
function extractTimerFromText(text) {
    // Match "10 minutes", "10 min", "10 mins", "10 分钟", "10分钟"
    const minMatch = text.match(/(\d+)\s*(?:minutes?|mins?|分钟|分)/i);
    if (minMatch && minMatch[1]) {
        return {
            seconds: parseInt(minMatch[1], 10) * 60,
            label: `${minMatch[1]} 分钟`
        };
    }
    // Match "30 seconds", "30 secs", "30 秒", "30秒"
    const secMatch = text.match(/(\d+)\s*(?:seconds?|secs?|秒钟|秒)/i);
    if (secMatch && secMatch[1]) {
        return {
            seconds: parseInt(secMatch[1], 10),
            label: `${secMatch[1]} 秒`
        };
    }
    return { seconds: null, label: "无计时" };
}
// Bundled sample recipe JSON-LD (no network request)
exports.BUNDLED_SAMPLE_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": "经典番茄意大利肉酱面 Bolognese Pasta",
    "recipeYield": "2 servings",
    "prepTime": "PT10M",
    "cookTime": "PT25M",
    "totalTime": "PT35M",
    "recipeIngredient": [
        "牛肉馅 250 g",
        "意大利面 200 g",
        "洋葱 1/2 个 (切碎)",
        "番茄罐头 400 g",
        "大蒜 2 瓣",
        "黑胡椒与盐 适量"
    ],
    "recipeInstructions": [
        {
            "@type": "HowToStep",
            "text": "平底锅倒入橄榄油，放入洋葱和大蒜碎翻炒至半透明（炒 3 分钟）"
        },
        {
            "@type": "HowToStep",
            "text": "加入牛肉馅中大火翻炒至变色，撒入盐和黑胡椒（翻炒 5 分钟）"
        },
        {
            "@type": "HowToStep",
            "text": "倒入番茄罐头转小火慢炖入味（慢炖 15 分钟）"
        },
        {
            "@type": "HowToStep",
            "text": "汤锅沸水加盐，放入意面煮至劲道（煮 8 分钟）"
        },
        {
            "@type": "HowToStep",
            "text": "意面沥干拌入肉酱，撒上奶酪装盘即可享用"
        }
    ]
};
// Parser for schema.org/Recipe JSON-LD
function parseRecipeJsonLd(jsonObj, sourceUrl) {
    const title = jsonObj.name || "未命名导入菜谱";
    const servings = parseInt(jsonObj.recipeYield, 10) || 2;
    const ingredients = [];
    if (Array.isArray(jsonObj.recipeIngredient)) {
        for (const ingStr of jsonObj.recipeIngredient) {
            ingredients.push({
                name: ingStr,
                amount: 1,
                unit: "份"
            });
        }
    }
    const steps = [];
    if (Array.isArray(jsonObj.recipeInstructions)) {
        jsonObj.recipeInstructions.forEach((inst, idx) => {
            const stepText = typeof inst === "string" ? inst : (inst.text || "");
            const timerInfo = extractTimerFromText(stepText);
            steps.push({
                order: idx + 1,
                text: stepText,
                timerSeconds: timerInfo.seconds,
                timerLabel: timerInfo.label,
                burner: idx % 2 === 0 ? "left" : "right"
            });
        });
    }
    return {
        id: "imported-" + Date.now(),
        title: title,
        servings: servings,
        source: sourceUrl,
        ingredients: ingredients,
        steps: steps,
        updatedAt: Date.now()
    };
}
//# sourceMappingURL=RecipeTypes.js.map
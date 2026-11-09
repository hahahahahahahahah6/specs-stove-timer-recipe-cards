// AppRunner.js - Universal Lens Studio Runner for Recipe Step Cards & Stove Timer

print("=================================================");
print("[Pan] SPECS 灶台计时器与智能菜谱卡应用 (AppRunner) 启动中...");
print("=================================================");

var RecipeTypes = require("./RecipeTypes");
var StoveTimer = require("./StoveTimerController");
var InteractableType = requireType("SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable");
var uiFont = requireAsset("../Fonts/NotoSansSC-Regular.ttf");
var controlTargets = [];

function cloneRecipe(recipe) { return JSON.parse(JSON.stringify(recipe)); }
function getCurrentRecipe() { return cloneRecipe(currentRecipe); }
function setRecipe(recipe) {
    currentRecipe = cloneRecipe(recipe);
    currentStepIndex = 0;
    renderStep();
}
function createText(obj) {
    var text = obj.createComponent("Component.Text");
    text.font = uiFont;
    return text;
}

// Each label owns one SIK target and one callback, never a global screen event.
function bindControl(obj, label, handler) {
    var hitObject = global.scene.createSceneObject(obj.name + "_HitTarget");
    hitObject.setParent(obj);
    var collider = hitObject.createComponent("Physics.ColliderComponent");
    collider.fitVisual = false;
    var box = Shape.createBoxShape();
    box.size = new vec3(8, 2, 0.5);
    collider.shape = box;
    var target = obj.createComponent(InteractableType);
    target.targetingMode = 3; // Near pinch and far-ray pinch (including mouse preview).
    target.onTriggerEnd.add(handler);
    controlTargets.push({label: label, object: hitObject, box: box, lastText: null});
}

function refreshHitTargets() {
    controlTargets.forEach(function(control) {
        if (control.lastText === control.label.text) return;
        try {
            var bounds = control.label.getBoundingBox();
            var size = bounds.getSize();
            if (size.x <= 0 || size.y <= 0) return; // Retry after text layout.
            var center = bounds.getCenter();
            control.box.size = new vec3(size.x + 1.2, size.y + 1.2, 0.5);
            control.object.getTransform().setLocalPosition(new vec3(center.x, center.y, 0));
            control.lastText = control.label.text;
        } catch (error) {
            // Text measurement can be rate-limited; retry on the next frame.
        }
    });
}

var timerController = StoveTimer.StoveTimerController.getInstance();
var currentRecipe = cloneRecipe(RecipeTypes.DEFAULT_RECIPE);
var currentStepIndex = 0;

// References to UI text components
var titleText = null;
var stepIndexText = null;
var stepContentText = null;
var ingredientsText = null;
var timerActionText = null;
var demoModeBtnText = null;
var statusNoticeText = null;

var leftTitleText = null;
var leftTimeText = null;
var leftStatusText = null;
var rightTitleText = null;
var rightTimeText = null;
var rightStatusText = null;

function buildUI() {
    print("[AppRunner] 正在构建 3D 浮动菜谱步骤卡与灶台计时器 HUD...");

    var rootObj = script.getSceneObject();
    rootObj.getTransform().setLocalPosition(new vec3(0, 0, 0));

    // ==========================================
    // 1. 菜谱步骤卡 (Recipe Step Card Panel)
    // 位于视线左前方 (x = -22, y = 6, z = -85 cm)
    // ==========================================
    var cardPanel = global.scene.createSceneObject("RecipeCardPanel");
    cardPanel.setParent(rootObj);
    cardPanel.getTransform().setLocalPosition(new vec3(0, 13, -85));
    cardPanel.getTransform().setLocalScale(new vec3(0.65, 0.65, 0.65));

    var titleObj = global.scene.createSceneObject("RecipeTitle");
    titleObj.setParent(cardPanel);
    titleObj.getTransform().setLocalPosition(new vec3(0, 15, 0));
    titleText = createText(titleObj);
    titleText.text = currentRecipe.title;
    titleText.size = 28;
    titleText.textFill.color = new vec4(1.0, 0.9, 0.35, 1.0); // Warm Gold

    var stepBadgeObj = global.scene.createSceneObject("StepBadge");
    stepBadgeObj.setParent(cardPanel);
    stepBadgeObj.getTransform().setLocalPosition(new vec3(0, 11, 0));
    stepIndexText = createText(stepBadgeObj);
    stepIndexText.text = "步骤 1 / 6";
    stepIndexText.size = 24;
    stepIndexText.textFill.color = new vec4(0.3, 0.85, 1.0, 1.0); // Cyan

    var contentObj = global.scene.createSceneObject("StepContent");
    contentObj.setParent(cardPanel);
    contentObj.getTransform().setLocalPosition(new vec3(0, 6, 0));
    stepContentText = createText(contentObj);
    stepContentText.text = "...";
    stepContentText.size = 24;
    stepContentText.textFill.color = new vec4(1.0, 1.0, 1.0, 1.0); // Pure White

    var ingObj = global.scene.createSceneObject("StepIngredients");
    ingObj.setParent(cardPanel);
    ingObj.getTransform().setLocalPosition(new vec3(0, 0, 0));
    ingredientsText = createText(ingObj);
    ingredientsText.text = "...";
    ingredientsText.size = 20;
    ingredientsText.textFill.color = new vec4(0.8, 0.9, 0.8, 1.0);

    var timerBtnObj = global.scene.createSceneObject("BtnStartTimer");
    timerBtnObj.setParent(cardPanel);
    timerBtnObj.getTransform().setLocalPosition(new vec3(0, -6, 0));
    timerActionText = createText(timerBtnObj);
    timerActionText.text = "[[>] 启动灶台计时器]";
    timerActionText.size = 24;
    timerActionText.textFill.color = new vec4(0.2, 1.0, 0.5, 1.0);

    // Prev / Next Buttons
    var prevObj = global.scene.createSceneObject("BtnPrevStep");
    prevObj.setParent(cardPanel);
    prevObj.getTransform().setLocalPosition(new vec3(-10, -12, 0));
    var prevText = createText(prevObj);
    prevText.text = "[[<] 上一步]";
    prevText.size = 22;
    prevText.textFill.color = new vec4(0.7, 0.8, 1.0, 1.0);

    var nextObj = global.scene.createSceneObject("BtnNextStep");
    nextObj.setParent(cardPanel);
    nextObj.getTransform().setLocalPosition(new vec3(10, -12, 0));
    var nextText = createText(nextObj);
    nextText.text = "[下一步 [>]]";
    nextText.size = 22;
    nextText.textFill.color = new vec4(0.7, 0.8, 1.0, 1.0);

    // ==========================================
    // 2. 双灶台计时器 (Stove Timers HUD)
    // 位于视线右前方，灶台正上方 (x = 22, y = 6, z = -85 cm)
    // ==========================================
    var stoveHUD = global.scene.createSceneObject("StoveTimersHUD");
    stoveHUD.setParent(rootObj);
    stoveHUD.getTransform().setLocalPosition(new vec3(0, -5, -85));
    stoveHUD.getTransform().setLocalScale(new vec3(0.7, 0.7, 0.7));

    // 左灶 (平底锅 Pan)
    var leftRoot = global.scene.createSceneObject("LeftBurner_Pan");
    leftRoot.setParent(stoveHUD);
    leftRoot.getTransform().setLocalPosition(new vec3(-10, 0, 0));

    var lLabel = global.scene.createSceneObject("LeftLabel");
    lLabel.setParent(leftRoot);
    lLabel.getTransform().setLocalPosition(new vec3(0, 10, 0));
    var lLabelText = createText(lLabel);
    lLabelText.text = "[Pan] 左灶 [平底锅 Pan]";
    lLabelText.size = 26;
    lLabelText.textFill.color = new vec4(1.0, 0.85, 0.3, 1.0);

    var lTitle = global.scene.createSceneObject("LeftTitle");
    lTitle.setParent(leftRoot);
    lTitle.getTransform().setLocalPosition(new vec3(0, 6, 0));
    leftTitleText = createText(lTitle);
    leftTitleText.text = "待命中 (Idle)";
    leftTitleText.size = 24;
    leftTitleText.textFill.color = new vec4(0.9, 0.9, 0.9, 1.0);

    var lTime = global.scene.createSceneObject("LeftTime");
    lTime.setParent(leftRoot);
    lTime.getTransform().setLocalPosition(new vec3(0, 0, 0));
    leftTimeText = createText(lTime);
    leftTimeText.text = "--:--";
    leftTimeText.size = 54;
    leftTimeText.textFill.color = new vec4(0.2, 0.95, 1.0, 1.0);

    var lStatus = global.scene.createSceneObject("LeftStatus");
    lStatus.setParent(leftRoot);
    lStatus.getTransform().setLocalPosition(new vec3(0, -5, 0));
    leftStatusText = createText(lStatus);
    leftStatusText.text = "等待步骤触发";
    leftStatusText.size = 20;
    leftStatusText.textFill.color = new vec4(0.6, 0.6, 0.6, 1.0);

    var lBtnT = global.scene.createSceneObject("LeftBtnToggle");
    lBtnT.setParent(leftRoot);
    lBtnT.getTransform().setLocalPosition(new vec3(-5, -9, 0));
    var lBtnTText = createText(lBtnT);
    lBtnTText.text = "[暂停/继续]";
    lBtnTText.size = 20;
    lBtnTText.textFill.color = new vec4(0.4, 0.9, 0.5, 1.0);

    var lBtnR = global.scene.createSceneObject("LeftBtnReset");
    lBtnR.setParent(leftRoot);
    lBtnR.getTransform().setLocalPosition(new vec3(5, -9, 0));
    var lBtnRText = createText(lBtnR);
    lBtnRText.text = "[重置]";
    lBtnRText.size = 20;
    lBtnRText.textFill.color = new vec4(1.0, 0.5, 0.4, 1.0);

    // 右灶 (汤锅 Pot)
    var rightRoot = global.scene.createSceneObject("RightBurner_Pot");
    rightRoot.setParent(stoveHUD);
    rightRoot.getTransform().setLocalPosition(new vec3(10, 0, 0));

    var rLabel = global.scene.createSceneObject("RightLabel");
    rLabel.setParent(rightRoot);
    rLabel.getTransform().setLocalPosition(new vec3(0, 10, 0));
    var rLabelText = createText(rLabel);
    rLabelText.text = "[Pot] 右灶 [汤锅 Pot]";
    rLabelText.size = 26;
    rLabelText.textFill.color = new vec4(1.0, 0.85, 0.3, 1.0);

    var rTitle = global.scene.createSceneObject("RightTitle");
    rTitle.setParent(rightRoot);
    rTitle.getTransform().setLocalPosition(new vec3(0, 6, 0));
    rightTitleText = createText(rTitle);
    rightTitleText.text = "待命中 (Idle)";
    rightTitleText.size = 24;
    rightTitleText.textFill.color = new vec4(0.9, 0.9, 0.9, 1.0);

    var rTime = global.scene.createSceneObject("RightTime");
    rTime.setParent(rightRoot);
    rTime.getTransform().setLocalPosition(new vec3(0, 0, 0));
    rightTimeText = createText(rTime);
    rightTimeText.text = "--:--";
    rightTimeText.size = 54;
    rightTimeText.textFill.color = new vec4(0.2, 0.95, 1.0, 1.0);

    var rStatus = global.scene.createSceneObject("RightStatus");
    rStatus.setParent(rightRoot);
    rStatus.getTransform().setLocalPosition(new vec3(0, -5, 0));
    rightStatusText = createText(rStatus);
    rightStatusText.text = "等待步骤触发";
    rightStatusText.size = 20;
    rightStatusText.textFill.color = new vec4(0.6, 0.6, 0.6, 1.0);

    var rBtnT = global.scene.createSceneObject("RightBtnToggle");
    rBtnT.setParent(rightRoot);
    rBtnT.getTransform().setLocalPosition(new vec3(-5, -9, 0));
    var rBtnTText = createText(rBtnT);
    rBtnTText.text = "[暂停/继续]";
    rBtnTText.size = 20;
    rBtnTText.textFill.color = new vec4(0.4, 0.9, 0.5, 1.0);

    var rBtnR = global.scene.createSceneObject("RightBtnReset");
    rBtnR.setParent(rightRoot);
    rBtnR.getTransform().setLocalPosition(new vec3(5, -9, 0));
    var rBtnRText = createText(rBtnR);
    rBtnRText.text = "[重置]";
    rBtnRText.size = 20;
    rBtnRText.textFill.color = new vec4(1.0, 0.5, 0.4, 1.0);

    // ==========================================
    // 3. 底部控制栏 (Control Bar)
    // 位于视线中下方 (x = 0, y = -14, z = -85 cm)
    // ==========================================
    var controlBar = global.scene.createSceneObject("ControlBar");
    controlBar.setParent(rootObj);
    controlBar.getTransform().setLocalPosition(new vec3(0, -18, -85));

    var demoObj = global.scene.createSceneObject("BtnDemo");
    demoObj.setParent(controlBar);
    demoObj.getTransform().setLocalPosition(new vec3(-10, 0, 0));
    demoModeBtnText = createText(demoObj);
    demoModeBtnText.text = "[60x] 演示模式: [分->秒 OFF]";
    demoModeBtnText.size = 14;
    demoModeBtnText.textFill.color = new vec4(0.9, 0.9, 0.4, 1.0);

    var voiceObj = global.scene.createSceneObject("BtnVoice");
    voiceObj.setParent(controlBar);
    voiceObj.getTransform().setLocalPosition(new vec3(-0.5, 0, 0));
    var voiceText = createText(voiceObj);
    voiceText.text = "Voice (simulated): add step";
    voiceText.size = 14;
    voiceText.textFill.color = new vec4(0.3, 0.9, 1.0, 1.0);

    var importObj = global.scene.createSceneObject("BtnImport");
    importObj.setParent(controlBar);
    importObj.getTransform().setLocalPosition(new vec3(7, 0, 0));
    var importText = createText(importObj);
    importText.text = "Bundled sample";
    importText.size = 14;
    importText.textFill.color = new vec4(0.4, 1.0, 0.7, 1.0);

    var resetRecipeObj = global.scene.createSceneObject("BtnResetRecipe");
    resetRecipeObj.setParent(controlBar);
    resetRecipeObj.getTransform().setLocalPosition(new vec3(12, 0, 0));
    var resetRecipeText = createText(resetRecipeObj);
    resetRecipeText.text = "[+] 原版番茄面";
    resetRecipeText.size = 14;
    resetRecipeText.textFill.color = new vec4(0.8, 0.8, 1.0, 1.0);

    var noticeObj = global.scene.createSceneObject("NoticeToast");
    noticeObj.setParent(controlBar);
    noticeObj.getTransform().setLocalPosition(new vec3(0, -4, 0));
    statusNoticeText = createText(noticeObj);
    statusNoticeText.text = "[Tip] 提示: 点击 [启动计时] 开启灶台计时 | 点击 [演示模式] 加速60倍";
    statusNoticeText.size = 12;
    statusNoticeText.textFill.color = new vec4(0.8, 0.85, 0.8, 1.0);

    // ==========================================
    // 4. Per-control SIK input listeners
    // ==========================================
    bindControl(prevObj, prevText, function() {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            renderStep();
        }
    });

    bindControl(nextObj, nextText, function() {
        if (currentStepIndex < currentRecipe.steps.length - 1) {
            currentStepIndex++;
            renderStep();
        }
    });

    bindControl(timerBtnObj, timerActionText, function() {
        var step = currentRecipe.steps[currentStepIndex];
        if (step && step.timerSeconds !== null) {
            var burner = step.burner || (currentStepIndex % 2 === 0 ? "left" : "right");
            timerController.addOrStartTimer(
                "step-" + currentStepIndex,
                step.timerLabel || "步骤 " + step.order,
                step.timerSeconds,
                currentStepIndex,
                burner
            );
        }
    });

    // Toggle Demo Mode (分->秒开关)
    bindControl(demoObj, demoModeBtnText, function() {
        var isDemo = timerController.toggleDemoMode();
        if (demoModeBtnText) {
            if (isDemo) {
                demoModeBtnText.text = "[60x] 演示模式: [分->秒 ON! 60x]";
                demoModeBtnText.textFill.color = new vec4(1.0, 0.3, 0.3, 1.0);
                showNotice("演示加速已开启！10分钟倒计时只需10秒快速展示");
            } else {
                demoModeBtnText.text = "[60x] 演示模式: [分->秒 OFF]";
                demoModeBtnText.textFill.color = new vec4(0.9, 0.9, 0.4, 1.0);
                showNotice("演示模式已关闭，恢复正常真实计时");
            }
        }
    });

    // 语音输入快捷模拟
    bindControl(voiceObj, voiceText, function() {
        var spoken = "加一步：沸水煮意面 9 分钟";
        print("[VoiceInput simulated] sample: " + spoken);
        var timerInfo = RecipeTypes.extractTimerFromText(spoken);
        var newOrder = currentRecipe.steps.length + 1;
        var recipe = getCurrentRecipe();
        recipe.steps.push({
            order: newOrder,
            text: "语音新增步骤：把意大利面放入沸水锅中（计时 9 分钟）",
            timerSeconds: timerInfo.seconds || 540,
            timerLabel: "语音煮面 (9m)",
            burner: "right"
        });
        var previousStep = currentStepIndex;
        setRecipe(recipe);
        currentStepIndex = previousStep;
        renderStep();
        showNotice("Simulated voice: added step " + newOrder + " (带9分钟计时器)");
    });

    // 网页一键导入
    bindControl(importObj, importText, function() {
        print("[BundledSample] Parsing bundled schema.org/Recipe JSON-LD...");
        var parsed = RecipeTypes.parseRecipeJsonLd(
            RecipeTypes.BUNDLED_SAMPLE_JSON_LD,
            "bundled-sample:recipe-json-ld"
        );
        setRecipe(parsed);
        var timerCount = parsed.steps.filter(function(step) { return step.timerSeconds !== null; }).length;
        showNotice("Bundled sample loaded: " + parsed.title + " (detected " + timerCount + " timers)");
    });

    // 恢复原版菜谱
    bindControl(resetRecipeObj, resetRecipeText, function() {
        setRecipe(RecipeTypes.DEFAULT_RECIPE);
        showNotice("已恢复黑客松演示菜谱: 番茄意大利面 (2人份)");
    });

    bindControl(lBtnT, lBtnTText, function() { toggleBurner("left"); });
    bindControl(lBtnR, lBtnRText, function() { resetBurner("left"); });
    bindControl(rBtnT, rBtnTText, function() { toggleBurner("right"); });
    bindControl(rBtnR, rBtnRText, function() { resetBurner("right"); });

    // 计时器回调
    timerController.onUpdate(function() {
        refreshStoveHUD();
    });

    timerController.onFinish(function(t) {
        showNotice("[!] [灶台警报] " + t.name + " 倒计时结束！请注意火候");
    });

    // 帧循环驱动倒计时
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function() {
        var dt = getDeltaTime();
        timerController.update(dt);
        refreshHitTargets();
    });

    renderStep();
    print("[OK] [AppRunner] UI 与交互事件监听器构建完成！");
}

function showNotice(msg) {
    if (statusNoticeText) {
        statusNoticeText.text = "[Notice] " + msg;
    }
    print("[Notice] " + msg);
}

function renderStep() {
    if (!titleText || !stepIndexText || !stepContentText || !ingredientsText || !timerActionText) return;

    titleText.text = currentRecipe.title + " (" + currentRecipe.servings + "人份)";
    var totalSteps = currentRecipe.steps.length;
    var step = currentRecipe.steps[currentStepIndex];
    if (!step) return;

    stepIndexText.text = "步骤 " + step.order + " / " + totalSteps;
    stepContentText.text = step.text;

    var ingSnippet = "";
    if (step.order === 1) ingSnippet = "所需食材: 清水 3 L, 盐 1 汤匙";
    else if (step.order === 2) ingSnippet = "所需食材: 大蒜 3 瓣(切片), 橄榄油 2 汤匙";
    else if (step.order === 3) ingSnippet = "所需食材: 番茄碎 400g, 盐 1/2 茶匙, 黑胡椒少许";
    else if (step.order === 4) ingSnippet = "所需食材: 意大利面 200g (沸水下锅)";
    else if (step.order === 5) ingSnippet = "所需食材: 煮熟意面, 留半杯煮面水";
    else if (step.order === 6) ingSnippet = "所需食材: 新鲜罗勒 5-6 片, 帕玛森奶酪 20g";
    else ingSnippet = "食材: 依食谱配置";

    ingredientsText.text = ingSnippet;

    if (step.timerSeconds !== null) {
        var mins = Math.floor(step.timerSeconds / 60);
        var secs = step.timerSeconds % 60;
        var timeStr = mins > 0 ? (mins + " 分钟") : (secs + " 秒");
        var burnerStr = step.burner === "right" ? "右灶汤锅" : "左灶平底锅";
        timerActionText.text = "[[>] 启动计时: " + timeStr + " (" + burnerStr + ")]";
        timerActionText.textFill.color = new vec4(0.2, 1.0, 0.5, 1.0);
    } else {
        timerActionText.text = "[此步骤不计时 (观察火候/出锅)]";
        timerActionText.textFill.color = new vec4(0.6, 0.6, 0.6, 1.0);
    }
}

function toggleBurner(burner) {
    var timer = timerController.getActiveTimer(burner);
    if (timer) timerController.toggleTimer(timer.id);
}
function resetBurner(burner) {
    var timer = timerController.getActiveTimer(burner);
    if (timer) timerController.resetTimer(timer.id);
}

function refreshStoveHUD() {
    var leftTimer = timerController.getActiveTimer("left");
    var rightTimer = timerController.getActiveTimer("right");

    updateBurnerCard(leftTimer, leftTitleText, leftTimeText, leftStatusText);
    updateBurnerCard(rightTimer, rightTitleText, rightTimeText, rightStatusText);
}

function updateBurnerCard(timer, titleComp, timeComp, statusComp) {
    if (!titleComp || !timeComp || !statusComp) return;

    if (!timer) {
        titleComp.text = "待命中 (Idle)";
        timeComp.text = "--:--";
        timeComp.textFill.color = new vec4(0.5, 0.5, 0.5, 1.0);
        statusComp.text = "等待步骤触发";
        statusComp.textFill.color = new vec4(0.5, 0.5, 0.5, 1.0);
        return;
    }

    titleComp.text = timer.name;
    timeComp.text = StoveTimer.StoveTimerController.formatTime(timer.remainingSeconds);

    if (timer.isFinished) {
        timeComp.text = "00:00";
        timeComp.textFill.color = new vec4(1.0, 0.2, 0.2, 1.0); // Red alert
        statusComp.text = "[!] 时间到！请注意火候";
        statusComp.textFill.color = new vec4(1.0, 0.8, 0.2, 1.0);
    } else if (timer.isRunning) {
        var demoTag = timerController.isDemoMode ? " [演示加速]" : "";
        timeComp.textFill.color = new vec4(0.2, 0.95, 0.9, 1.0); // Cyan
        statusComp.text = "[>] 倒计时中" + demoTag;
        statusComp.textFill.color = new vec4(0.3, 1.0, 0.4, 1.0);
    } else {
        timeComp.textFill.color = new vec4(0.9, 0.7, 0.2, 1.0);
        statusComp.text = "[||] 已暂停";
        statusComp.textFill.color = new vec4(0.9, 0.7, 0.2, 1.0);
    }
}

// Wait until the scene's SIK components have completed their awake phase.
script.createEvent("OnStartEvent").bind(buildUI);

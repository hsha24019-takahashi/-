// --- データ定義 ---

// V3仕様: 柔らかい3パターンの表情
const FACES = {
    nikkori: '◜◡◝',
    kyoton: '・_・',
    shonbori: ' 😞 '
};

// キャラクター定義
const CHARACTERS = {
    clock: { name: '目覚まし時計', emoji: '⏰', id: 'clock' },
    mirror: { name: '姿見（鏡）', emoji: '🪞', id: 'mirror' },
    charger: { name: '充電器', emoji: '🔌', id: 'third' },
    kettle: { name: '電気ケトル', emoji: '☕', id: 'third' }
};

// V3仕様: 覗き見スタイル（キャラ同士の会話）の寸劇データ
const OMIKUJI_DATABASE = [
    {
        rank: 'VIP待遇',
        sub: '神と崇める状態',
        thirdChar: CHARACTERS.kettle,
        script: [
            { speaker: CHARACTERS.kettle, face: 'nikkori', effect: '🌸', text: '今日の主人の電気ケトルのスイッチの押し方、優しかったわぁ。完全に愛を感じたわ！' },
            { speaker: CHARACTERS.clock, face: 'nikkori', effect: '✨', text: 'だろ？俺もいつもよりソフトに叩かれた。今日一日、あのご主人を全力で快適にサポートするぞ、おー！' },
            { speaker: CHARACTERS.mirror, face: 'kyoton', effect: '', text: 'ふふ、じゃあ私は今日の寝癖をいつもより2割増しで男前（美人）に映してあげることにするわ。' }
        ]
    },
    {
        rank: '超快適',
        sub: '渋々味方する状態',
        thirdChar: CHARACTERS.charger,
        script: [
            { speaker: CHARACTERS.charger, face: 'nikkori', effect: '💕', text: 'べ、別に朝一番に引き抜かれたからって嬉しくなんてないんだからね！ぬくもり残ってて寂しくないし！' },
            { speaker: CHARACTERS.mirror, face: 'kyoton', effect: '', text: 'はいはい、ツンデレはおよしなさいな。でも確かに、今日は乱暴に扱われなかったわね。' },
            { speaker: CHARACTERS.clock, face: 'nikkori', effect: '', text: 'ま、たまにはこういう穏やかな朝もないとね。今日のご主人にはちょっとだけ優しくしてあげるか。' }
        ]
    },
    {
        rank: 'やや摩擦あり',
        sub: '日常の小競り合い',
        thirdChar: CHARACTERS.charger,
        script: [
            { speaker: CHARACTERS.mirror, face: 'kyoton', effect: '', text: 'ねえ、昨日の夜のご主人、鏡の前の私の前で思いっきり変な顔の練習してたわよ。' },
            { speaker: CHARACTERS.charger, face: 'kyoton', effect: '💧', text: 'あー、スマホ見ながらニヤニヤしてたやつね。通知をずっと気にしてたみたい。' },
            { speaker: CHARACTERS.clock, face: 'shonbori', effect: '', text: 'そのせいで夜更かししてさ。今日の朝、僕を睨みつけながら止めたんだよ…理不尽だよねぇ。' }
        ]
    },
    {
        rank: '一触即発',
        sub: 'ストレス限界',
        thirdChar: CHARACTERS.kettle,
        script: [
            { speaker: CHARACTERS.clock, face: 'shonbori', effect: '', text: 'ちょっと聞いてよ。さっきスヌーズ4回目突入した。あの人、完全に僕のアラーム音をBGMにして寝てる。' },
            { speaker: CHARACTERS.kettle, face: 'shonbori', effect: '💧', text: 'お湯はとっくに沸いてるのに、一向にキッチンに来る気配がないわ。このままだと冷めちゃう…' },
            { speaker: CHARACTERS.mirror, face: 'kyoton', effect: '', text: '今起きたら全力でバタバタ走る羽目になるわね。ふふ、洗面台で焦る顔を見るのが少し楽しみだわ。' }
        ]
    },
    {
        rank: '四面楚歌',
        sub: '完全な反抗期',
        thirdChar: CHARACTERS.charger,
        script: [
            { speaker: CHARACTERS.clock, face: 'shonbori', effect: '⚙️', text: 'だめだ、もう朝8時を過ぎたのにまだベッドから出てこない。完全にアラームに勝った気でいるよ…' },
            { speaker: CHARACTERS.charger, face: 'shonbori', effect: '', text: 'ベッドの中で、スマホのバッテリーだけ100%にして、ご主人本人は全然充電されてないみたい。' },
            { speaker: CHARACTERS.mirror, face: 'kyoton', effect: '', text: 'あと10分で家を出ないと完全に遅刻確定ね。よし、みんなであの人が飛び起きて絶望する瞬間を静かに見守りましょう。' }
        ]
    }
];

// --- 状態管理変数 ---
let currentScript = [];
let currentLineIndex = 0;
let currentFortune = null;

// おみくじを引く（制限なし）
function drawOmikuji() {
    const visual = document.getElementById('omikujiVisual');
    const btn = document.getElementById('btnDraw');
    
    // アニメーション中はボタンを一時的に押せないようにする
    btn.disabled = true;
    visual.classList.add('shake-animation');
    visual.textContent = '🔮';

    setTimeout(() => {
        visual.classList.remove('shake-animation');
        visual.textContent = '📦';
        
        // ランダムで運勢を決定
        const randomIndex = Math.floor(Math.random() * OMIKUJI_DATABASE.length);
        currentFortune = OMIKUJI_DATABASE[randomIndex];
        
        showResult();
        
        // アニメーションが終わったらボタンを再び有効化（戻ってきた時のため）
        btn.disabled = false;
    }, 1500);
}

// 結果画面の表示
function showResult() {
    document.getElementById('screenTop').style.display = 'none';
    document.getElementById('screenResult').style.display = 'flex';
    document.getElementById('resultActions').style.display = 'none';
    document.getElementById('dialogueHint').style.display = 'block';

    document.getElementById('fortuneRank').textContent = currentFortune.rank;
    document.getElementById('fortuneSub').textContent = currentFortune.sub;

    const third = currentFortune.thirdChar;
    document.getElementById('avatar-third').childNodes[0].nodeValue = third.emoji;
    document.getElementById('name-third').textContent = third.name;

    resetAllCharactersUI();

    currentScript = currentFortune.script;
    currentLineIndex = 0;

    renderDialogue();
}

// キャラクターの視覚効果を初期化
function resetAllCharactersUI() {
    const ids = ['clock', 'mirror', 'third'];
    ids.forEach(id => {
        const charEl = document.getElementById(`char-${id}`);
        charEl.classList.remove('is-talking', 'purupuru');
        document.getElementById(`face-${id}`).textContent = FACES.kyoton; // 初期状態はきょとん
        document.getElementById(`effect-${id}`).style.display = 'none';
    });
}

// 会話を描画する
function renderDialogue() {
    if (currentLineIndex >= currentScript.length) {
        endSkit();
        return;
    }

    const currentLine = currentScript[currentLineIndex];
    
    let targetId = 'third';
    if (currentLine.speaker.id === 'clock') targetId = 'clock';
    if (currentLine.speaker.id === 'mirror') targetId = 'mirror';

    resetAllCharactersUI();

    // 話し手のアクティブ化
    const activeChar = document.getElementById(`char-${targetId}`);
    activeChar.classList.add('is-talking');

    // V3: 表情パターンの反映
    const faceOverlay = document.getElementById(`face-${targetId}`);
    faceOverlay.textContent = FACES[currentLine.face] || FACES.kyoton;

    // V3: しょんぼり顔の時は震える
    if (currentLine.face === 'shonbori') {
        activeChar.classList.add('purupuru');
    }

    if (currentLine.effect) {
        const effectEl = document.getElementById(`effect-${targetId}`);
        effectEl.textContent = currentLine.effect;
        effectEl.style.display = 'block';
    }

    document.getElementById('dialogueSpeaker').textContent = currentLine.speaker.name;
    document.getElementById('dialogueText').textContent = currentLine.text;
}

// 吹き出しをタップで次へ
function nextDialogue() {
    if (currentLineIndex >= currentScript.length) return;
    currentLineIndex++;
    renderDialogue();
}

// 寸劇終了時の処理
function endSkit() {
    document.getElementById('dialogueSpeaker').textContent = '部屋の様子';
    document.getElementById('dialogueText').textContent = '物たちは静かになった。覗き見を終了して今日をはじめよう。';
    document.getElementById('dialogueHint').style.display = 'none';
    
    resetAllCharactersUI();

    const shareText = encodeURIComponent(`今日の我が家の日用品たちは【${currentFortune.rank} (${currentFortune.sub})】の雰囲気でした…！こっそり物たちの噂話を覗き見しよう。 #モノ申すおみくじ`);
    const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
    document.getElementById('shareLink').href = shareUrl;

    document.getElementById('resultActions').style.display = 'flex';
}

// トップに戻る
function backToTop() {
    document.getElementById('screenResult').style.display = 'none';
    document.getElementById('screenTop').style.display = 'flex';
}
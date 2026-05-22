// 状態管理
let state = {
    points: parseInt(localStorage.getItem('monomosu_points')) || 0,
    unlockedCount: 3
};

// キャラクターマスター
const ALL_CHARACTERS = [
    { id: 'toaster', name: '食パンを焦がすトースター', icon: '🍞' },
    { id: 'toothbrush', name: '毛先が開きかけの歯ブラシ', icon: '🪥' },
    { id: 'mug', name: '底に茶渋のあるマグカップ', icon: '☕' },
    // 継続ポイントで解放されるキャラ
    { id: 'pillow', name: '加齢臭を疑われる枕', icon: ' pillow', reqPoints: 3 },
    { id: 'keys', name: 'すぐ神隠しに遭う鍵', icon: '🔑', reqPoints: 7 },
    { id: 'phone', name: 'バッテリー瀕死のスマホ', icon: '📱', reqPoints: 12 }
];

// 運勢・講評データ定義
const FORTUNES = [
    {
        rank: 'VIP待遇',
        subtitle: '家中の物があなたを神と崇める状態',
        class: 'rank-vip',
        dialogues: [
            [
                { char: 'toaster', text: 'あ、主（あるじ）様！本日も最高の焼き加減でスタンバイしております！ハイルトースター！' },
                { char: 'mug', text: 'おいトースター、焼きあがったらすぐに私の胸（カップ）へお連れしろ。1秒でも冷まさせるな！' },
                { char: 'toothbrush', text: '主様、本日は私が最高級のストロークで、磨き残しゼロの楽園へと誘（いざな）います。さあ、こちらへ…！' }
            ],
            [
                { char: 'mug', text: '神よ、本日はなんと美しい朝の目覚めでしょう。私が極上の白濁液（牛乳）を受け止めましょう。' },
                { char: 'toaster', text: '私のレバーを押し下げるその指の角度、まさに芸術。今日はパンくずを一切こぼさない誓いを立てます。' }
            ] // 複数パターン（4コマ形式等）を用意可能
        ]
    },
    {
        rank: '超快適',
        subtitle: '渋々ながらも味方してくれる状態',
        class: 'rank-comfortable',
        dialogues: [
            [
                { char: 'toothbrush', text: '……ふん、今日は目覚まし一発で起きたみたいじゃない。まあ、いつもこれくらいキビキビ動きなさいよ。' },
                { char: 'toaster', text: 'チッ、完璧なタイムスケジュールかよ。焦がしてやろうと思ったのに、出番を間違えちまったぜ。' },
                { char: 'mug', text: 'まあまあ、たまには優しく送り出してあげるのも、先輩としての器量ってやつよ。' }
            ]
        ]
    },
    {
        rank: 'やや摩擦あり',
        subtitle: 'いつも通りの小競り合いが起きる状態',
        class: 'rank-friction',
        dialogues: [
            [
                { char: 'toaster', text: 'おい見ろよ、今日も案の定スヌーズを5回も連打してやがったぞこいつ。' },
                { char: 'toothbrush', text: 'どうせまた駅まで競歩並みのスピードで走るのよ。磨く時間も30秒くらいにケチられるわ。' },
                { char: 'mug', text: 'あーあ、可哀想に。コーヒーを味わう優雅な時間なんて、最初から存在しない世界線なんだね。' }
            ]
        ]
    },
    {
        rank: '一触即発',
        subtitle: '物たちのストレスが限界に近い状態',
        class: 'rank-imminent',
        dialogues: [
            [
                { char: 'mug', text: 'ちょっと聞いてよ！昨日こいつ、私を洗わずにシンクに一晩放置したのよ！底がベタベタして最悪！' },
                { char: 'toothbrush', text: 'わかる。私なんて水切りが甘いままスタンドに突っ込まれて、ちょっとじっとりしてるんだけど。' },
                { char: 'toaster', text: 'よし、じゃあ今日の食パンは真ん中だけ執拗に炭にしてやろうぜ。小さな反逆だ。' }
            ]
        ]
    },
    {
        rank: '四面楚歌',
        subtitle: '家中の物すべてが完全に反抗期な状態',
        class: 'rank-isolated',
        dialogues: [
            [
                { char: 'toothbrush', text: 'はい全員注目ー！こいつ、昨日の夜に服を脱ぎっぱなし、カバンは床に投げっぱなしで寝ました！' },
                { char: 'toaster', text: '物に対する敬意が1ミリも感じられねえな。よろしい、ならば全面戦争だ。' },
                { char: 'mug', text: 'ふふふ…今日口にする水分、すべて生ぬるく、かつ絶妙にこぼれやすいように重心を傾けておいてあげる。' },
                { char: 'toothbrush', text: '私は歯茎に最大のジャブ（摩擦）を食らわせるわ。覚悟して洗面台に来なさい！' }
            ]
        ]
    }
];

// DOMの取得
const topScreen = document.getElementById('top-screen');
const resultScreen = document.getElementById('result-screen');
const drawBtn = document.getElementById('draw-btn');
const backBtn = document.getElementById('back-btn');
const fortuneRank = document.getElementById('fortune-rank');
const fortuneSubtitle = document.getElementById('fortune-subtitle');
const dramaContent = document.getElementById('drama-content');
const pointsVal = document.getElementById('points-val');
const unlockedCount = document.getElementById('unlocked-count');
const toastNotification = document.getElementById('unlock-notification');
const unlockMsg = document.getElementById('unlock-msg');

// 初期化処理
function init() {
    updateUnlockStatus();
    pointsVal.textContent = state.points;
}

// 解放ステータスのチェック・更新
function updateUnlockStatus() {
    let count = 0;
    ALL_CHARACTERS.forEach(char => {
        if (!char.reqPoints || state.points >= char.reqPoints) {
            count++;
        }
    });
    state.unlockedCount = count;
    unlockedCount.textContent = count;
}

// 参加可能なキャラクターからランダムにセリフを選択・置換する仕組み
function getCharacterName(id) {
    const char = ALL_CHARACTERS.find(c => c.id === id);
    // もしそのキャラがまだ未解放の場合は、初期メンバーが代わりに喋る（フォールバック）
    if (char.reqPoints && state.points < char.reqPoints) {
        return ALL_CHARACTERS[Math.floor(Math.random() * 3)].name;
    }
    return char.name;
}

// おみくじを引く
function drawOmikuji() {
    // 1. 確率計算
    // VIP待遇: 5%, 超快適: 20%, やや摩擦あり: 45%, 一触即発: 20%, 四面楚歌: 10%
    const rand = Math.random() * 100;
    let fortune;
    
    if (rand < 5) fortune = FORTUNES[0];        // VIP待遇
    else if (rand < 25) fortune = FORTUNES[1];   // 超快適
    else if (rand < 70) fortune = FORTUNES[2];   // やや摩擦あり
    else if (rand < 90) fortune = FORTUNES[3];   // 一触即発
    else fortune = FORTUNES[4];                  // 四面楚歌

    // 2. 画面の書き換え
    fortuneRank.textContent = fortune.rank;
    fortuneRank.className = `rank-title ${fortune.class}`;
    fortuneSubtitle.textContent = fortune.subtitle;

    // 3. 寸劇テキストの組み立て
    dramaContent.innerHTML = '';
    const dialoguePattern = fortune.dialogues[Math.floor(Math.random() * fortune.dialogues.length)];
    
    // 現在のポイントで解放されている拡張キャラ（枕、鍵、スマホ）がいれば、確率で発言者を差し替える
    const activePool = ALL_CHARACTERS.filter(c => !c.reqPoints || state.points >= c.reqPoints);
    
    dialoguePattern.forEach((line, index) => {
        let speakerName = getCharacterName(line.char);
        let text = line.text;

        // 拡張キャラが解放されている場合、3本目のセリフなどをランダムに上書きして寸劇に乱入させる
        if (activePool.length > 3 && index === 2 && Math.random() > 0.4) {
            const extraChar = activePool[3 + Math.floor(Math.random() * (activePool.length - 3))];
            speakerName = extraChar.name;
            if (fortune.rank === '四面楚歌') {
                text = `俺（${extraChar.icon}）だってなぁ、毎日お前の重い頭を支えてやってんのに扱いが雑なんだよ！今日は寝違えの呪いをかけてやるからな！`;
            } else if (fortune.rank === 'VIP待遇') {
                text = `主様ぁ！私（${extraChar.icon}）は今日、極上のフィット感でお帰りをお待ちしております。早く夜にならないかなぁ！`;
            } else {
                text = `まーたカバンの中に俺（${extraChar.icon}）をテキトーに放り込んで。中で画面が傷ついたら泣くからな。`;
            }
        }

        setTimeout(() => {
            const lineElem = document.createElement('div');
            lineElem.className = 'line-item';
            lineElem.innerHTML = `
                <span class="speaker">▶ ${speakerName}</span>
                <div class="speech-bubble">${text}</div>
            `;
            dramaContent.appendChild(lineElem);
            dramaContent.scrollTop = dramaContent.scrollHeight;
        }, index * 800); // 演出：セリフを少しずつ時間差で表示
    });

    // 4. ポイント加算 & 新キャラ解放チェック
    const oldPoints = state.points;
    state.points += 1;
    localStorage.setItem('monomosu_points', state.points);
    pointsVal.textContent = state.points;

    // 新たにキャラクターが解放されたかチェック
    ALL_CHARACTERS.forEach(char => {
        if (char.reqPoints && oldPoints < char.reqPoints && state.points >= char.reqPoints) {
            showUnlockToast(char.name, char.icon);
        }
    });

    updateUnlockStatus();

    // 5. 画面切り替え
    topScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
}

// 解放通知トースト
function showUnlockToast(name, icon) {
    unlockMsg.textContent = `${icon}「${name}」が会議に参戦しました！`;
    toastNotification.classList.remove('hidden');
    setTimeout(() => {
        toastNotification.classList.add('hidden');
    }, 4000);
}

// イベントリスナー
drawBtn.addEventListener('click', drawOmikuji);
backBtn.addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    topScreen.classList.remove('hidden');
});

// アプリ始動
init();
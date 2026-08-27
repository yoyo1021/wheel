const cvs = document.getElementById("wheel"), ctx = cvs.getContext("2d");
const prizes = [
    { t: "1000元", p: 10, c: "#FFB3BA" },
    { t: "2000元", p: 20, c: "#BAE1FF" }, 
    { t: "3000元", p: 17.5, c: "#BAFFC9" }, 
    { t: "5000元", p: 5, c: "#FFFFBA" },
    { t: "3000元", p: 17.5, c: "#BAFFC9" }, 
    { t: "1000元", p: 10, c: "#FFB3BA" },
    { t: "2000元", p: 20, c: "#BAE1FF" }, 
];

// 🎵 初始化音效物件
// ------------------------
const tickSound = new Audio('./Music/winning-reward-1983.wav');
const winSound = new Audio('./Music/applause-510.wav');

// 設定轉動音效為循環播放
tickSound.loop = true; 
// ✅ 關鍵 2：監聽播放進度，強行切掉後面的 2 秒空白


// 稍微調低轉動音效音量 (0.0 到 1.0)
tickSound.volume = 0.5; 

const spinDuration = 6; // 想要轉幾秒就改成幾（例如：5 代表轉 5 秒）
let start = 0;

/**
 * 依照機率繪製轉盤
 */
function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    let startAngle = -Math.PI / 2; // 從正上方開始畫 (-90°)

    prizes.forEach(item => {
        const angle = item.p / 100 * Math.PI * 2;   

        // 畫扇形
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 240, startAngle, startAngle + angle);
        ctx.closePath();
        ctx.fillStyle = item.c;
        ctx.fill();

        // 白色邊框
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // 寫文字
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(startAngle + angle / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(item.t, 200, 0);
        ctx.restore();

        startAngle += angle;
    });
}

draw();

let currentRotate = 0; 

document.getElementById("spin").onclick = () => {
    // iPhone 限制：必須在 click 事件當下直接觸發 .play() 才能順利播放
    // 這裡先播放再重設時間，確保聲音可以同步出來
    tickSound.currentTime = 0;
    tickSound.play().catch(err => console.log("音效播放被瀏覽器阻擋:", err));


    document.getElementById("result").innerHTML ="";

    // 1. 直接亂數一個角度
    const randomAngle = Math.random() * 360;
    
    // 2. 多轉幾圈 (累加角度防止倒轉)
    currentRotate += (360 * 8) + randomAngle;

    cvs.style.transition = `transform ${spinDuration}s cubic-bezier(.15,.9,.15,1)`;
    cvs.style.transform = `rotate(${currentRotate}deg)`;

    // 點擊後立刻停用按鈕，防止重複點擊導致動畫錯亂
    document.getElementById("spin").disabled = true;

     // 在轉盤轉動快結束前（例如第 4.5 秒），讓轉動音效慢慢停下來，視覺感更逼真
    setTimeout(() => {
        tickSound.pause();
    }, (spinDuration * 1000) + 200);

    setTimeout(() => {
        // 3. 精準計算指針位置 (100% 同步畫面)
        const finalAngle = currentRotate % 360;
        let pointer = (360 - finalAngle) % 360;
        let current = 0;
        let prize = "";

        for (let i = 0; i < prizes.length; i++) {
            current += (prizes[i].p / 100) * 360;
            if (pointer <= current) {
                prize = prizes[i].t;
                break;
            }
        }

        // 4. 顯示中獎文字
        document.getElementById("result").innerHTML =
            `🎉 恭喜妳抽中 <b>${prize}</b><br>生日快樂❤️`;

        // 🎵 播放中獎音效
        winSound.currentTime = 0;
        winSound.play().catch(err => console.log(err));
        
        // 5. ✨ 觸發滿螢幕噴發碎紙屑特效 ✨
        triggerConfetti();

        // 6. 抽獎結束，重新啟用按鈕，讓她可以繼續玩
        document.getElementById("spin").disabled = false;

    }, (spinDuration * 1000) + 300);
};

/**
 * 碎紙屑特效控制函數
 */
/**
 * 純 JS/CSS 噴發碎紙屑特效 (無須任何外部套件)
 */
function triggerConfetti() {
    const colors = ['#FFB3BA', '#BAE1FF', '#BAFFC9', '#FFFFBA', '#FFDFBA', '#E8AEFF'];
    const pieceCount = 750; // 彩帶總數量

    for (let i = 0; i < pieceCount; i++) {
        // 建立彩色紙屑元素
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        // 隨機顏色
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // 隨機寬高（稍微有點變化比較自然）
        piece.style.width = Math.random() * 8 + 6 + 'px';
        piece.style.height = Math.random() * 12 + 10 + 'px';

        // 隨機初始水平位置 (0% ~ 100% 螢幕寬度)
        piece.style.left = Math.random() * 100 + 'vw';

        // 隨機掉落速度與延遲 (讓它們錯開掉落，持續約 3~4 秒)
        const duration = Math.random() * 2 + 2; // 2 ~ 4 秒
        const delay = Math.random() * 1.5;     // 0 ~ 1.5 秒延遲
        piece.style.animationDuration = duration + 's';
        piece.style.animationDelay = delay + 's';

        // 將紙屑加到畫面上
        document.body.appendChild(piece);

        // 動播結束後自動把 DOM 元素刪除，避免佔用記憶體
        setTimeout(() => {
            piece.remove();
        }, (duration + delay) * 1000);
    }
}


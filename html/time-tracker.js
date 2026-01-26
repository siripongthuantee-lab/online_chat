// Time Tracker System for Online Talk
// ระบบนับเวลาใช้งานแบบเรียลไทม์

(function() {
    'use strict';
    
    console.log('⏱️ Time Tracker loaded');

    let startTime = null;
    let timerInterval = null;
    let currentUserId = null;

    // ฟังก์ชันแปลงนาทีเป็นรูปแบบที่อ่านง่าย
    function formatTime(minutes) {
        if (!minutes || minutes === 0) {
            return '0 นาที';
        }
        
        if (minutes < 60) {
            return `${Math.round(minutes)} นาที`;
        } else if (minutes < 1440) { // น้อยกว่า 1 วัน
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชม.`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return hours > 0 ? `${days} วัน ${hours} ชม.` : `${days} วัน`;
        }
    }

    // ฟังก์ชันบันทึกเวลาลง Firebase
    async function saveTimeToFirebase(userId, additionalMinutes) {
        if (!firebase || !firebase.database) {
            console.error('❌ Firebase not initialized');
            return;
        }

        try {
            const userRef = firebase.database().ref('users/' + userId);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val() || {};
            
            const currentOnlineTime = userData.onlineTime || 0;
            const newOnlineTime = currentOnlineTime + additionalMinutes;
            
            await userRef.update({
                onlineTime: newOnlineTime,
                lastActive: new Date().toISOString()
            });
            
            console.log(`✅ Time saved: +${additionalMinutes} minutes (Total: ${newOnlineTime} minutes)`);
            
            // อัพเดท UI ถ้ามี element
            updateTimeDisplay(newOnlineTime);
            
            return newOnlineTime;
        } catch (error) {
            console.error('❌ Error saving time:', error);
        }
    }

    // ฟังก์ชันอัพเดทการแสดงผลเวลา
    function updateTimeDisplay(totalMinutes) {
        const timeElements = [
            document.getElementById('onlineTime'),
            document.querySelector('[id*="onlineTime"]'),
            document.querySelector('.online-time')
        ];
        
        timeElements.forEach(el => {
            if (el) {
                el.textContent = formatTime(totalMinutes);
            }
        });
    }

    // ฟังก์ชันเริ่มนับเวลา
    function startTracking(userId) {
        if (timerInterval) {
            console.log('⚠️ Timer already running');
            return;
        }

        currentUserId = userId;
        startTime = Date.now();
        
        console.log('▶️ Time tracking started for user:', userId);

        // บันทึกเวลาทุก 1 นาที
        timerInterval = setInterval(async () => {
            const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
            
            if (elapsedMinutes > 0) {
                await saveTimeToFirebase(userId, elapsedMinutes);
                startTime = Date.now(); // รีเซ็ตเวลาเริ่มต้น
            }
        }, 30000); // ทุก 30 วินาที (บันทึกบ่อยขึ้น)

        // บันทึกทันทีเมื่อปิดหน้าต่าง
        window.addEventListener('beforeunload', () => {
            stopTracking();
        });

        // บันทึกเมื่อหน้าซ่อน (เช่น เปลี่ยน tab)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
                if (elapsedMinutes > 0) {
                    saveTimeToFirebase(userId, elapsedMinutes);
                    startTime = Date.now();
                }
            }
        });
    }

    // ฟังก์ชันหยุดนับเวลา
    async function stopTracking() {
        if (!timerInterval || !currentUserId) {
            console.log('⚠️ No active timer');
            return;
        }

        console.log('⏹️ Stopping time tracking');

        clearInterval(timerInterval);
        timerInterval = null;

        // บันทึกเวลาที่เหลือก่อนปิด
        const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
        if (elapsedMinutes > 0) {
            await saveTimeToFirebase(currentUserId, elapsedMinutes);
        }

        currentUserId = null;
        startTime = null;
    }

    // ฟังก์ชันโหลดเวลาทั้งหมดของผู้ใช้
    async function loadUserTime(userId) {
        if (!firebase || !firebase.database) {
            console.error('❌ Firebase not initialized');
            return;
        }

        try {
            const userRef = firebase.database().ref('users/' + userId);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val() || {};
            
            const totalMinutes = userData.onlineTime || 0;
            updateTimeDisplay(totalMinutes);
            
            console.log(`📊 User total time: ${formatTime(totalMinutes)}`);
            return totalMinutes;
        } catch (error) {
            console.error('❌ Error loading time:', error);
        }
    }

    // Export functions
    window.timeTracker = {
        start: startTracking,
        stop: stopTracking,
        load: loadUserTime,
        format: formatTime
    };

    // เริ่มนับเวลาอัตโนมัติเมื่อมีการ login
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log('👤 User detected, starting time tracker');
                loadUserTime(user.uid);
                startTracking(user.uid);
            } else {
                console.log('👤 No user, stopping time tracker');
                stopTracking();
            }
        });
    }

    console.log('✅ Time Tracker initialized');
})();
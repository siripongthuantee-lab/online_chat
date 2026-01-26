// Theme Management System for Online Talk
// ระบบจัดการธีมสำหรับทั้งเว็บไซต์

(function() {
    'use strict';
    
    console.log('🎨 Theme Manager loaded');

    // ฟังก์ชันใช้ธีม
    function applyTheme(theme) {
        console.log('✨ Applying theme:', theme);
        
        // ลบ class ธีมทั้งหมด
        document.body.classList.remove('theme-white', 'theme-dark', 'theme-cream');
        
        // เพิ่ม class ธีมที่เลือก
        if (theme === 'white') {
            document.body.classList.add('theme-white');
        } else if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            // cream เป็น default แต่เพิ่ม class เพื่อความชัดเจน
            document.body.classList.add('theme-cream');
        }
        
        console.log('✅ Theme applied. Body classes:', document.body.className);
        
        // อัพเดท UI ถ้ามีปุ่มเลือกธีม
        updateThemeButtons(theme);
    }

    // ฟังก์ชันอัพเดทปุ่มธีม
    function updateThemeButtons(theme) {
        // ลบ class selected จากปุ่มทั้งหมด
        document.querySelectorAll('.theme-selector').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // เพิ่ม class selected ให้ปุ่มที่เลือก
        const themeMap = {
            'cream': 'themeCream',
            'white': 'themeWhite',
            'dark': 'themeDark'
        };
        
        const selectedBtn = document.getElementById(themeMap[theme]);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
            console.log('✅ Theme button selected:', themeMap[theme]);
        }
    }

    // ฟังก์ชันโหลดธีมที่บันทึกไว้
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('siteTheme') || 'cream';
        console.log('📂 Loading saved theme:', savedTheme);
        applyTheme(savedTheme);
        return savedTheme;
    }

    // ฟังก์ชันบันทึกธีม
    function saveTheme(theme) {
        console.log('💾 Saving theme:', theme);
        localStorage.setItem('siteTheme', theme);
        applyTheme(theme);
        
        // ถ้ามี Firebase user ให้บันทึกลง Firebase ด้วย
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            const user = firebase.auth().currentUser;
            const database = firebase.database();
            
            database.ref('users/' + user.uid).update({ 
                theme: theme 
            }).then(() => {
                console.log('✅ Theme saved to Firebase');
            }).catch(error => {
                console.error('❌ Error saving theme to Firebase:', error);
            });
        }
    }

    // ฟังก์ชันโหลดธีมจาก Firebase
    async function loadThemeFromFirebase() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const user = firebase.auth().currentUser;
                if (user) {
                    const database = firebase.database();
                    const snapshot = await database.ref('users/' + user.uid + '/theme').once('value');
                    const firebaseTheme = snapshot.val();
                    
                    if (firebaseTheme) {
                        console.log('☁️ Loading theme from Firebase:', firebaseTheme);
                        localStorage.setItem('siteTheme', firebaseTheme);
                        applyTheme(firebaseTheme);
                    }
                }
            } catch (error) {
                console.error('❌ Error loading theme from Firebase:', error);
            }
        }
    }

    // ตั้งค่า Event Listeners สำหรับปุ่มธีม (ถ้ามี)
    function setupThemeButtons() {
        const creamBtn = document.getElementById('themeCream');
        const whiteBtn = document.getElementById('themeWhite');
        const darkBtn = document.getElementById('themeDark');

        if (creamBtn) {
            creamBtn.addEventListener('click', () => {
                console.log('🖱️ Cream theme button clicked');
                saveTheme('cream');
            });
        }
        if (whiteBtn) {
            whiteBtn.addEventListener('click', () => {
                console.log('🖱️ White theme button clicked');
                saveTheme('white');
            });
        }
        if (darkBtn) {
            darkBtn.addEventListener('click', () => {
                console.log('🖱️ Dark theme button clicked');
                saveTheme('dark');
            });
        }

        console.log('🔘 Theme buttons initialized');
    }

    // Export functions ให้ใช้งานได้จากไฟล์อื่น
    window.saveTheme = saveTheme;
    window.applyTheme = applyTheme;
    window.loadSavedTheme = loadSavedTheme;

    // โหลดธีมทันทีเมื่อโหลดหน้า
    loadSavedTheme();

    // รอให้ DOM โหลดเสร็จแล้วค่อยตั้งค่าปุ่ม
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupThemeButtons();
            loadThemeFromFirebase();
        });
    } else {
        setupThemeButtons();
        loadThemeFromFirebase();
    }

    // ฟังการเปลี่ยนแปลง auth state เพื่อโหลดธีมจาก Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log('👤 User logged in, loading theme from Firebase');
                loadThemeFromFirebase();
            }
        });
    }

    console.log('✅ Theme Manager initialized');
})();
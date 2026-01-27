// Admin Panel Fixes and Enhancements
// เพิ่มไฟล์นี้ใน AdminPanel.html หลัง firebase-config.js

console.log('🔧 Admin Panel Fixes loaded');

// ฟังก์ชันเพิ่มเติมที่อาจจะขาดหายไป

// Enhanced View Room with full details
window.viewRoomDetails = async function(roomId) {
    try {
        const database = firebase.database();
        const snapshot = await database.ref('rooms/' + roomId).once('value');
        const room = snapshot.val();
        
        if (!room) {
            alert('ไม่พบข้อมูลห้อง');
            return;
        }
        
        const memberCount = room.members ? Object.keys(room.members).length : 0;
        const messageCount = room.messages ? Object.keys(room.messages).length : 0;
        
        // Create modal for detailed view
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        modal.innerHTML = `
            <div class="bg-white border-4 border-black rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold">🏠 รายละเอียดห้อง</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-3xl hover:text-gray-600">&times;</button>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                        <h4 class="font-bold mb-2">ข้อมูลพื้นฐาน</h4>
                        <p><strong>โค้ดห้อง:</strong> ${room.code || roomId}</p>
                        <p><strong>ประเภท:</strong> ${room.type || 'ไม่ระบุ'}</p>
                        <p><strong>สถานะ:</strong> ${room.isActive !== false ? '🟢 Active' : '⚪ Inactive'}</p>
                        <p><strong>สร้างเมื่อ:</strong> ${room.createdAt || 'ไม่ทราบ'}</p>
                    </div>
                    
                    <div class="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                        <h4 class="font-bold mb-2">สมาชิก (${memberCount} คน)</h4>
                        <div class="space-y-2 max-h-48 overflow-y-auto">
                            ${room.members ? Object.entries(room.members).map(([uid, member]) => `
                                <div class="bg-white p-2 rounded border border-gray-300">
                                    <p class="font-bold">${member.username || 'Unknown'}</p>
                                    <p class="text-xs text-gray-500">UID: ${uid}</p>
                                </div>
                            `).join('') : '<p class="text-gray-500">ไม่มีสมาชิก</p>'}
                        </div>
                    </div>
                    
                    <div class="bg-purple-50 border-2 border-purple-400 rounded-lg p-4">
                        <h4 class="font-bold mb-2">ข้อความ (${messageCount})</h4>
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                            ${room.messages ? Object.entries(room.messages).slice(-10).map(([msgId, msg]) => `
                                <div class="bg-white p-2 rounded border border-gray-300">
                                    <p class="font-bold text-sm">${msg.username || 'Unknown'}</p>
                                    <p class="text-sm">${msg.text || msg.message || ''}</p>
                                    <p class="text-xs text-gray-500">${new Date(msg.timestamp).toLocaleString('th-TH')}</p>
                                </div>
                            `).join('') : '<p class="text-gray-500">ไม่มีข้อความ</p>'}
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="window.location.href='RoomPage.html?code=${room.code || roomId}'" class="flex-1 px-4 py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold hover:bg-blue-600">
                            🚪 เข้าห้อง
                        </button>
                        <button onclick="deleteRoom('${roomId}'); this.closest('.fixed').remove();" class="flex-1 px-4 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold hover:bg-red-600">
                            🗑️ ลบห้อง
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error viewing room:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง');
    }
};

// Enhanced View User with full details
window.viewUserDetails = async function(uid) {
    try {
        const database = firebase.database();
        const snapshot = await database.ref('users/' + uid).once('value');
        const user = snapshot.val();
        
        if (!user) {
            alert('ไม่พบข้อมูลผู้ใช้');
            return;
        }
        
        // Create modal for detailed view
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        modal.innerHTML = `
            <div class="bg-white border-4 border-black rounded-2xl p-6 max-w-lg w-full" onclick="event.stopPropagation()">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold">👤 รายละเอียดผู้ใช้</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-3xl hover:text-gray-600">&times;</button>
                </div>
                
                <div class="space-y-4">
                    <div class="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                        <h4 class="font-bold mb-2">ข้อมูลส่วนตัว</h4>
                        <p><strong>ชื่อผู้ใช้:</strong> ${user.username || 'ไม่มี'}</p>
                        <p><strong>อีเมล:</strong> ${user.email}</p>
                        <p><strong>UID:</strong> ${uid}</p>
                    </div>
                    
                    <div class="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                        <h4 class="font-bold mb-2">สถิติ</h4>
                        <p><strong>เวลาออนไลน์:</strong> ${user.onlineTime || 0} นาที</p>
                        <p><strong>สถานะ:</strong> ${user.isAdmin ? '🛡️ Admin' : '👤 User'}</p>
                        <p><strong>แบน:</strong> ${user.banned ? '❌ ถูกแบน' : '✅ ปกติ'}</p>
                    </div>
                    
                    ${user.theme ? `
                        <div class="bg-purple-50 border-2 border-purple-400 rounded-lg p-4">
                            <h4 class="font-bold mb-2">การตั้งค่า</h4>
                            <p><strong>ธีม:</strong> ${user.theme}</p>
                        </div>
                    ` : ''}
                    
                    <div class="flex gap-2">
                        <button onclick="toggleAdmin('${uid}', ${!user.isAdmin}); this.closest('.fixed').remove();" class="flex-1 px-4 py-2 ${user.isAdmin ? 'bg-gray-500' : 'bg-red-500'} text-white border-2 border-black rounded-lg font-bold">
                            ${user.isAdmin ? '❌ ลบ Admin' : '✅ ตั้ง Admin'}
                        </button>
                        <button onclick="if(confirm('ลบผู้ใช้นี้?')) { deleteUser('${uid}'); this.closest('.fixed').remove(); }" class="flex-1 px-4 py-2 bg-red-600 text-white border-2 border-black rounded-lg font-bold">
                            🗑️ ลบ
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error viewing user:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
    }
};

// Ban/Unban User
window.banUser = async function(uid) {
    try {
        const database = firebase.database();
        const snapshot = await database.ref('users/' + uid + '/banned').once('value');
        const isBanned = snapshot.val() || false;
        
        if (confirm(`${isBanned ? 'ปลดแบน' : 'แบน'}ผู้ใช้นี้?`)) {
            await database.ref('users/' + uid).update({ banned: !isBanned });
            showToast(`✅ ${isBanned ? 'ปลดแบน' : 'แบน'}ผู้ใช้สำเร็จ`, 'success');
            document.getElementById('loadUsersBtn')?.click();
        }
    } catch (error) {
        console.error('Error banning user:', error);
        showToast('❌ เกิดข้อผิดพลาด', 'error');
    }
};

// Enhanced Room Statistics
window.loadRoomStatistics = async function() {
    try {
        const database = firebase.database();
        const snapshot = await database.ref('rooms').once('value');
        const rooms = snapshot.val() || {};
        
        let totalMembers = 0;
        let totalMessages = 0;
        let activeRooms = 0;
        
        Object.values(rooms).forEach(room => {
            if (room.members) totalMembers += Object.keys(room.members).length;
            if (room.messages) totalMessages += Object.keys(room.messages).length;
            if (room.isActive !== false && room.members && Object.keys(room.members).length > 0) {
                activeRooms++;
            }
        });
        
        // Update stats if elements exist
        if (document.getElementById('roomsActive')) {
            document.getElementById('roomsActive').textContent = activeRooms;
        }
        if (document.getElementById('roomsEmpty')) {
            document.getElementById('roomsEmpty').textContent = Object.keys(rooms).length - activeRooms;
        }
        
        console.log('✅ Room statistics loaded:', { totalMembers, totalMessages, activeRooms });
    } catch (error) {
        console.error('❌ Error loading room statistics:', error);
    }
};

// Enhanced User Statistics
window.loadUserStatistics = async function() {
    try {
        const database = firebase.database();
        const snapshot = await database.ref('users').once('value');
        const users = snapshot.val() || {};
        
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        
        let newUsersToday = 0;
        let activeUsersToday = 0;
        let totalOnlineTime = 0;
        let userCount = 0;
        
        Object.values(users).forEach(user => {
            if (user.createdAt && new Date(user.createdAt).getTime() > oneDayAgo) {
                newUsersToday++;
            }
            if (user.lastActive && user.lastActive > oneDayAgo) {
                activeUsersToday++;
            }
            if (user.onlineTime) {
                totalOnlineTime += user.onlineTime;
                userCount++;
            }
        });
        
        const avgOnlineTime = userCount > 0 ? Math.round(totalOnlineTime / userCount) : 0;
        
        // Update stats if elements exist
        if (document.getElementById('newUsersToday')) {
            document.getElementById('newUsersToday').textContent = newUsersToday;
        }
        if (document.getElementById('activeUsersToday')) {
            document.getElementById('activeUsersToday').textContent = activeUsersToday;
        }
        if (document.getElementById('avgOnlineTime')) {
            document.getElementById('avgOnlineTime').textContent = avgOnlineTime + ' นาที';
        }
        
        console.log('✅ User statistics loaded:', { newUsersToday, activeUsersToday, avgOnlineTime });
    } catch (error) {
        console.error('❌ Error loading user statistics:', error);
    }
};

// Override viewRoom to use enhanced version
if (typeof window.viewRoom !== 'undefined') {
    window.viewRoom = window.viewRoomDetails;
}

// Load statistics on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            loadRoomStatistics();
            loadUserStatistics();
        }, 1000);
    });
} else {
    setTimeout(() => {
        loadRoomStatistics();
        loadUserStatistics();
    }, 1000);
}

console.log('✅ Admin Panel Fixes initialized');
console.log('📊 New functions available:');
console.log('  - viewRoomDetails(roomId)');
console.log('  - viewUserDetails(uid)');
console.log('  - banUser(uid)');
console.log('  - loadRoomStatistics()');
console.log('  - loadUserStatistics()');

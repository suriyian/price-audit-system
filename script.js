// 全局变量
let currentAction = null;
let priceChart = null;

// 模拟数据
const mockData = {
    1: {
        id: 1,
        name: "有机大米 5kg装",
        merchant: "爱心超市（王府井店）",
        location: "北京市东城区",
        declaredPrice: 89.00,
        marketPrice: 65.00,
        riskLevel: "high",
        riskScore: 85,
        image: "https://via.placeholder.com/200x200?text=有机大米",
        priceComparison: {
            labels: ['申报价格', '市场均价', '同区域均价', '商家历史均价', '平台建议价'],
            data: [89, 65, 62.5, 78, 68]
        },
        history: [
            { date: '2026-02-08', product: '东北大米 10kg', status: 'approved' },
            { date: '2026-02-05', product: '有机蔬菜礼盒', status: 'rejected' },
            { date: '2026-02-01', product: '纯净水 24瓶装', status: 'approved' }
        ],
        aiAnalysis: {
            priceDeviation: 36.9,
            merchantAvgPremium: 28,
            regionAvgPrice: 62.5,
            suggestion: "建议驳回，价格明显偏高"
        }
    },
    2: {
        id: 2,
        name: "儿童营养奶粉",
        merchant: "母婴用品店",
        location: "北京市朝阳区",
        declaredPrice: 298.00,
        marketPrice: 268.00,
        riskLevel: "medium",
        riskScore: 45,
        image: "https://via.placeholder.com/200x200?text=儿童奶粉",
        priceComparison: {
            labels: ['申报价格', '市场均价', '同区域均价', '商家历史均价', '平台建议价'],
            data: [298, 268, 275, 285, 270]
        },
        history: [
            { date: '2026-02-07', product: '婴儿尿不湿', status: 'approved' },
            { date: '2026-02-03', product: '儿童玩具套装', status: 'approved' }
        ],
        aiAnalysis: {
            priceDeviation: 11.2,
            merchantAvgPremium: 6.3,
            regionAvgPrice: 275,
            suggestion: "价格略高但在合理范围内，建议通过"
        }
    },
    3: {
        id: 3,
        name: "学习用品套装",
        merchant: "文具专营店",
        location: "北京市海淀区",
        declaredPrice: 45.00,
        marketPrice: 48.00,
        riskLevel: "low",
        riskScore: 15,
        image: "https://via.placeholder.com/200x200?text=学习用品",
        priceComparison: {
            labels: ['申报价格', '市场均价', '同区域均价', '商家历史均价', '平台建议价'],
            data: [45, 48, 46, 44, 47]
        },
        history: [
            { date: '2026-02-06', product: '学生书包', status: 'approved' },
            { date: '2026-02-04', product: '文具礼盒', status: 'approved' },
            { date: '2026-02-02', product: '彩色笔套装', status: 'approved' }
        ],
        aiAnalysis: {
            priceDeviation: -6.3,
            merchantAvgPremium: -8.3,
            regionAvgPrice: 46,
            suggestion: "价格合理，建议通过"
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadItem(1); // 默认加载第一个商品
});

// 初始化页面
function initializePage() {
    // 初始化图表
    initializeChart();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 更新待审核数量
    updatePendingCount();
}

// 绑定事件监听器
function bindEventListeners() {
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    approveItem();
                    break;
                case '2':
                    e.preventDefault();
                    rejectItem();
                    break;
                case '3':
                    e.preventDefault();
                    requestMoreInfo();
                    break;
            }
        }
    });
    
    // 点击模态框背景关闭
    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// 初始化图表
function initializeChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    priceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['申报价格', '市场均价', '同区域均价', '商家历史均价', '平台建议价'],
            datasets: [{
                label: '价格对比 (元)',
                data: [89, 65, 62.5, 78, 68],
                backgroundColor: [
                    'rgba(255, 107, 107, 0.8)',
                    'rgba(81, 207, 102, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(155, 89, 182, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 107, 107, 1)',
                    'rgba(81, 207, 102, 1)',
                    'rgba(52, 152, 219, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(155, 89, 182, 1)'
                ],
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `¥${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + value;
                        },
                        color: '#666'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666',
                        maxRotation: 45
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// 加载商品数据
function loadItem(itemId) {
    const data = mockData[itemId];
    if (!data) return;
    
    // 更新商品信息
    document.getElementById('productName').textContent = data.name;
    document.getElementById('productImage').src = data.image;
    document.getElementById('declaredPrice').textContent = `¥${data.declaredPrice.toFixed(2)}`;
    document.getElementById('marketPrice').textContent = `¥${data.marketPrice.toFixed(2)}`;
    
    // 更新商家信息
    document.querySelector('.merchant-name').textContent = data.merchant;
    document.querySelector('.merchant-location').textContent = data.location;
    
    // 更新风险等级
    const riskLevel = document.getElementById('riskLevel');
    riskLevel.className = `risk-level ${data.riskLevel}`;
    riskLevel.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${getRiskLevelText(data.riskLevel)}</span>
    `;
    
    // 更新风险详情
    updateRiskDetails(data);
    
    // 更新图表
    updateChart(data.priceComparison);
    
    // 更新历史记录
    updateHistory(data.history);
    
    // 更新AI建议
    document.querySelector('.ai-suggestion span').textContent = `AI建议：${data.aiAnalysis.suggestion}`;
    
    // 更新侧边栏选中状态
    updateSidebarSelection(itemId);
    
    // 清空评论框
    document.getElementById('reviewComment').value = '';
}

// 获取风险等级文本
function getRiskLevelText(level) {
    const texts = {
        'high': '高风险',
        'medium': '中风险',
        'low': '低风险'
    };
    return texts[level] || '未知';
}

// 更新风险详情
function updateRiskDetails(data) {
    const riskDetails = document.querySelector('.risk-details');
    const analysis = data.aiAnalysis;
    
    riskDetails.innerHTML = `
        <div class="risk-item">
            <div class="risk-icon warning">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="risk-content">
                <h4>价格异常</h4>
                <p>申报价格比市场价${analysis.priceDeviation > 0 ? '高出' : '低于'} <strong>${Math.abs(analysis.priceDeviation).toFixed(1)}%</strong></p>
            </div>
        </div>
        
        <div class="risk-item">
            <div class="risk-icon info">
                <i class="fas fa-store"></i>
            </div>
            <div class="risk-content">
                <h4>商家历史</h4>
                <p>该商家过去3个月平均溢价 <strong>${analysis.merchantAvgPremium.toFixed(1)}%</strong></p>
            </div>
        </div>
        
        <div class="risk-item">
            <div class="risk-icon success">
                <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="risk-content">
                <h4>区域对比</h4>
                <p>同区域商家平均价格 <strong>¥${analysis.regionAvgPrice.toFixed(1)}</strong></p>
            </div>
        </div>
    `;
}

// 更新图表
function updateChart(priceData) {
    if (priceChart) {
        priceChart.data.labels = priceData.labels;
        priceChart.data.datasets[0].data = priceData.data;
        priceChart.update('active');
    }
}

// 更新历史记录
function updateHistory(historyData) {
    const historyList = document.querySelector('.history-list');
    
    historyList.innerHTML = historyData.map(item => `
        <div class="history-item">
            <div class="history-date">${item.date}</div>
            <div class="history-product">${item.product}</div>
            <div class="history-status ${item.status}">
                ${item.status === 'approved' ? '通过' : '驳回'}
            </div>
        </div>
    `).join('');
}

// 更新侧边栏选中状态
function updateSidebarSelection(itemId) {
    document.querySelectorAll('.pending-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const targetItem = document.querySelector(`.pending-item[onclick="loadItem(${itemId})"]`);
    if (targetItem) {
        targetItem.classList.add('active');
    }
}

// 更新待审核数量
function updatePendingCount() {
    const count = Object.keys(mockData).length;
    document.getElementById('pendingCount').textContent = count;
}

// 切换侧边栏
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// 审核操作
function approveItem() {
    currentAction = 'approve';
    showConfirmModal('通过审核', '确定要通过这个商品的价格审核吗？', 'success');
}

function rejectItem() {
    currentAction = 'reject';
    showConfirmModal('驳回申请', '确定要驳回这个商品的价格申请吗？', 'danger');
}

function requestMoreInfo() {
    currentAction = 'request';
    showConfirmModal('要求补充信息', '确定要求商家补充更多信息吗？', 'info');
}

// 显示确认对话框
function showConfirmModal(title, message, type) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // 设置按钮样式
    confirmBtn.className = `btn btn-${type === 'success' ? 'approve' : type === 'danger' ? 'reject' : 'request-info'}`;
    confirmBtn.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'danger' ? 'times' : 'question-circle'}"></i> 确认`;
    
    modal.classList.add('show');
    modal.style.display = 'flex';
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    currentAction = null;
}

// 确认操作
function confirmAction() {
    const comment = document.getElementById('reviewComment').value;
    
    if (!comment.trim() && currentAction !== 'approve') {
        alert('请填写审核意见');
        return;
    }
    
    // 模拟API调用
    const actionText = {
        'approve': '通过',
        'reject': '驳回',
        'request': '要求补充信息'
    };
    
    // 显示加载状态
    const confirmBtn = document.getElementById('confirmBtn');
    const originalContent = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<div class="loading"></div> 处理中...';
    confirmBtn.disabled = true;
    
    // 模拟网络请求
    setTimeout(() => {
        closeModal();
        showNotification(`操作成功：已${actionText[currentAction]}`, 'success');
        
        // 重置按钮状态
        confirmBtn.innerHTML = originalContent;
        confirmBtn.disabled = false;
        
        // 移除当前项目并加载下一个
        removeCurrentItemAndLoadNext();
    }, 1500);
}

// 移除当前项目并加载下一个
function removeCurrentItemAndLoadNext() {
    const activeItem = document.querySelector('.pending-item.active');
    if (activeItem) {
        // 添加移除动画
        activeItem.style.transform = 'translateX(100%)';
        activeItem.style.opacity = '0';
        
        setTimeout(() => {
            activeItem.remove();
            
            // 更新待审核数量
            const newCount = document.querySelectorAll('.pending-item').length;
            document.getElementById('pendingCount').textContent = newCount;
            
            // 加载下一个项目
            const nextItem = document.querySelector('.pending-item');
            if (nextItem) {
                const nextId = nextItem.getAttribute('onclick').match(/\d+/)[0];
                loadItem(parseInt(nextId));
            } else {
                showNotification('所有商品已审核完成！', 'success');
            }
        }, 300);
    }
}

// 显示通知
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加通知样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #51cf66, #40c057)' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动移除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 导出数据（用于测试）
function exportAuditData() {
    const data = {
        timestamp: new Date().toISOString(),
        auditResults: mockData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_results.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 批量操作
function batchApprove() {
    if (confirm('确定要批量通过所有低风险商品吗？')) {
        showNotification('批量操作已启动', 'success');
    }
}

function batchReject() {
    if (confirm('确定要批量驳回所有高风险商品吗？')) {
        showNotification('批量操作已启动', 'success');
    }
}

// 搜索功能
function searchItems(query) {
    const items = document.querySelectorAll('.pending-item');
    items.forEach(item => {
        const name = item.querySelector('.item-name').textContent.toLowerCase();
        const merchant = item.querySelector('.item-merchant').textContent.toLowerCase();
        
        if (name.includes(query.toLowerCase()) || merchant.includes(query.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 过滤功能
function filterByRisk(riskLevel) {
    const items = document.querySelectorAll('.pending-item');
    items.forEach(item => {
        const risk = item.querySelector('.item-risk').classList;
        
        if (riskLevel === 'all' || risk.contains(riskLevel)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 统计功能
function getAuditStatistics() {
    const stats = {
        total: Object.keys(mockData).length,
        highRisk: Object.values(mockData).filter(item => item.riskLevel === 'high').length,
        mediumRisk: Object.values(mockData).filter(item => item.riskLevel === 'medium').length,
        lowRisk: Object.values(mockData).filter(item => item.riskLevel === 'low').length
    };
    
    console.log('审核统计:', stats);
    return stats;
}
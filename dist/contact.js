const contactStatus = document.querySelector('#contact-status');
document.querySelector('#contact-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.querySelector('#contact-wechat').textContent);
    contactStatus.textContent = '已复制，打开微信搜索添加。';
  } catch {
    contactStatus.textContent = '请长按或选中上方微信号，手动复制后到微信搜索。';
  }
});

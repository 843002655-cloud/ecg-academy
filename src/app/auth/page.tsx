export default function AuthPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="card">
        <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 text-center mb-6 font-serif">登录 / 注册</h1>
        <p className="text-sm text-[#6B7F96] dark:text-slate-400 text-center mb-6">
          使用邮箱和密码，新用户将自动注册
        </p>
        <form action="/api/auth-handler" method="POST" className="space-y-4">
          <input type="hidden" name="redirect" value="/" />
          <input type="email" name="email" placeholder="邮箱" required className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100" />
          <input type="password" name="password" placeholder="密码（至少6位）" required minLength={6} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100" />
          <button type="submit" className="w-full bg-[#2D8C6A] dark:bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 transition-colors">
            登录 / 注册
          </button>
        </form>
        <p className="text-xs text-[#8FA0B4] dark:text-slate-500 text-center mt-4 leading-relaxed">
          注册即表示同意 <a href="/terms" className="text-[#2D8C6A] dark:text-emerald-400 hover:underline">服务条款</a>
        </p>
      </div>
    </div>
  );
}

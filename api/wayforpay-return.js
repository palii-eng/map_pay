// WayForPay повертає браузер на returnUrl через POST-редірект форми, а
// статичний хостинг Vercel обробляє лише GET/HEAD для сторінок SPA. Ця
// serverless-функція приймає будь-який метод і перенаправляє на GET.
export default function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`)
  const payment = url.searchParams.get('payment') || ''
  const query = payment ? `?payment=${encodeURIComponent(payment)}` : ''
  res.writeHead(302, { Location: `/payment-confirmed${query}` })
  res.end()
}

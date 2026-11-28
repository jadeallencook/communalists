'use client';

import './globals.css';

// The last resort: the site's own layout failed, so there are no
// translations, header or theme. Says what happened in all four UI
// languages and offers to try again (decision #68).

const TEXT = [
    {
        lang: 'en',
        title: 'Something went wrong',
        body: "Communalists couldn't load. Try again in a few minutes.",
        retry: 'Try again',
    },
    {
        lang: 'es',
        title: 'Algo salió mal',
        body: 'Communalists no se pudo cargar. Inténtalo de nuevo en unos minutos.',
        retry: 'Intentar de nuevo',
    },
    {
        lang: 'vi',
        title: 'Đã xảy ra lỗi',
        body: 'Không tải được Communalists. Hãy thử lại sau vài phút.',
        retry: 'Thử lại',
    },
    {
        lang: 'zh',
        title: '出了点问题',
        body: '无法加载 Communalists。请过几分钟再试。',
        retry: '重试',
    },
];

export default function GlobalError({ retry }: { retry: () => void }) {
    return (
        <html lang="en">
            <body className="bg-background text-foreground">
                <title>Communalists</title>
                <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-16">
                    {TEXT.map((text, i) => (
                        <section
                            key={text.lang}
                            lang={text.lang}
                            className="flex flex-col items-start gap-2"
                        >
                            {i === 0 ? (
                                <h1 className="text-2xl font-semibold">
                                    {text.title}
                                </h1>
                            ) : (
                                <h2 className="text-xl font-semibold">
                                    {text.title}
                                </h2>
                            )}
                            <p>{text.body}</p>
                            <button
                                type="button"
                                onClick={retry}
                                className="rounded-lg border px-3 py-1.5 font-medium"
                            >
                                {text.retry}
                            </button>
                        </section>
                    ))}
                </main>
            </body>
        </html>
    );
}

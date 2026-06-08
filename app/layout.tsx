import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: {
		default: `${site.title} by ${site.author}`,
		template: `%s | ${site.title}`,
	},
	description: site.description,
	icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Script id="reader-preferences-bootstrap" strategy="beforeInteractive">
					{`(function(){try{var path=location.pathname;if(path!=='/cover'&&!path.startsWith('/chapters/'))return;var p=JSON.parse(localStorage.getItem('ads-reader-preferences')||'{}');var r=document.documentElement;r.classList.add('is-reading');var themes=['original','quiet','paper','bold','calm','focus','system'];var legacy={light:'original',dark:'quiet'};var t=typeof p.theme==='string'?(legacy[p.theme]||(themes.indexOf(p.theme)>-1&&p.theme!=='system'?p.theme:'original')):'original';var appearances=['light','dark','system'];var a=typeof p.appearance==='string'&&appearances.indexOf(p.appearance)>-1?p.appearance:(p.theme==='system'?'system':p.theme==='dark'||p.theme==='quiet'?'dark':'light');r.dataset.readerTheme=t;r.dataset.readerAppearance=a;var f=typeof p.fontSize==='number'?Math.max(0,Math.min(4,p.fontSize)):2;r.dataset.readerFontSize=String(f);r.dataset.readerLayout=p.layoutMode==='pages'?'pages':'scroll';r.style.setProperty('--reader-font-scale',String([0.88,0.94,1,1.08,1.16][f]));}catch(e){}})();`}
				</Script>
				{children}
			</body>
		</html>
	);
}

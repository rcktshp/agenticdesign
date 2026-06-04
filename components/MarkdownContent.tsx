import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { externalLinkAttrs, isExternalUrl } from '@/lib/links';

const components: Components = {
	a: ({ href, children }) => {
		const attrs = href && isExternalUrl(href) ? externalLinkAttrs : {};
		return (
			<a href={href} {...attrs}>
				{children}
			</a>
		);
	},
};

type Props = { content: string };

export default function MarkdownContent({ content }: Props) {
	return (
		<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
			{content}
		</ReactMarkdown>
	);
}

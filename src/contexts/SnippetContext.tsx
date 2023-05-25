import { LanguageKeyType } from '@custom-types/languages';
import { createContext, useState } from 'react';
import snippets, { ComponentType } from '../snippets';

interface SnippetContextInterface {
    setLanguage: React.Dispatch<React.SetStateAction<LanguageKeyType>>;
    language: LanguageKeyType;
    snippet: (path: string, page?: ComponentType) => string;
}

const SnippetContext = createContext<SnippetContextInterface>(null);

export const SnippetProvider = ({ children }) => {
    const [language, setLanguage] = useState<LanguageKeyType>('english');

    const snippet = (path: string, page: ComponentType = 'shared'): string => {
        const snip = snippets[page][path];
        return snip?.[language] ?? snip?.['english'] ?? '';
    };

    return (
        <SnippetContext.Provider
            value={{
                setLanguage,
                snippet,
                language,
            }}
        >
            {children}
        </SnippetContext.Provider>
    );
};

export default SnippetContext;

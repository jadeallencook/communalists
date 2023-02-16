import { LanguageKeyTypes } from '@custom-types/languages';
import { createContext, useState } from 'react';
import snippets, { ComponentType } from '../snippets';

interface SnippetContextInterface {
    setLanguage: React.Dispatch<React.SetStateAction<LanguageKeyTypes>>;
    language: LanguageKeyTypes;
    snippet: (path: string, page?: ComponentType) => string;
}

const SnippetContext = createContext<SnippetContextInterface>(null);

export const SnippetProvider = ({ children }) => {
    const [language, setLanguage] = useState<LanguageKeyTypes>('english');

    const snippet = (path: string, page?: ComponentType): string => {
        if (!page) {
            page = 'shared';
        }
        let snip = [page, path, language].reduce(
            (value: any, key: string) =>
                value[key] && value !== '' ? value[key] : '',
            snippets
        );

        if (!snip && language !== 'english') {
            snip = [page, path, 'english'].reduce(
                (value: any, key: string) =>
                    value[key] && value !== '' ? value[key] : '',
                snippets
            );
        }

        return typeof snip !== 'string' ? '' : snip;
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

// Sample dictionary words for stories.
import type { DefinitionFormValues } from './definition-form';

export const mutualAidValues: DefinitionFormValues = {
    slug: 'mutual-aid',
    text: {
        en: {
            word: 'Mutual aid',
            definition:
                'Neighbors helping each other directly with what they need, like food, rides or rent, and sharing what they have. Everyone can give and receive.',
            details:
                'Mutual aid is not charity. In charity, one group gives and another receives. In mutual aid, people help each other as equals.\n\nMutual aid groups are often run by volunteers.',
        },
        es: {
            word: 'Ayuda mutua',
            definition:
                'Vecinos que se ayudan directamente con lo que necesitan, como comida, transporte o renta, y comparten lo que tienen.',
            details: '',
        },
        vi: {
            word: 'Tương trợ',
            definition:
                'Hàng xóm giúp đỡ nhau trực tiếp với những gì họ cần, như thức ăn, đi lại hay tiền thuê nhà.',
            details: '',
        },
        zh: {
            word: '互助',
            definition:
                '邻居之间直接互相帮助，满足食物、交通或房租等需要，并分享自己拥有的东西。',
            details: '',
        },
    },
    related: ['solidarity'],
};

export const relatedOptions = [
    { slug: 'food-pantry', word: 'Food pantry' },
    { slug: 'free-fridge', word: 'Free fridge' },
    { slug: 'harm-reduction', word: 'Harm reduction' },
    { slug: 'organizer', word: 'Organizer' },
    { slug: 'solidarity', word: 'Solidarity' },
    { slug: 'tenant-union', word: 'Tenant union' },
];

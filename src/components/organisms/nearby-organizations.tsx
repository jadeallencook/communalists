import { ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    OrganizationCard,
    type OrganizationCardProps,
} from '@/components/molecules/organization-card';
import { Link } from '@/i18n/navigation';

export interface NearbyOrganizationsProps {
    /** The organization's city, e.g. "San Jose, California". */
    place: string;
    /** Already chosen and sorted (nearbyOrganizations), with distance in `detail`. */
    organizations: OrganizationCardProps[];
    /** /find from this city, for the rest. */
    findQuery: { country: string; placeId: string; radius: string };
}

/**
 * At the end of an organization's page: a few other groups near it, closest
 * first, each linking to its page. Renders nothing when there are none.
 */
export function NearbyOrganizations({
    place,
    organizations,
    findQuery,
}: NearbyOrganizationsProps) {
    const t = useTranslations('Organizations.page');
    if (organizations.length === 0) return null;
    return (
        <section
            aria-labelledby="nearby-organizations"
            className="flex flex-col gap-3"
        >
            <h2
                id="nearby-organizations"
                className="font-heading text-xl font-semibold"
            >
                {t('nearbyTitle', { place })}
            </h2>
            <ul className="flex flex-col gap-2">
                {organizations.map((org) => (
                    <li key={org.handle}>
                        <OrganizationCard {...org} />
                    </li>
                ))}
            </ul>
            <Button asChild variant="outline" className="self-start">
                <Link href={{ pathname: '/find', query: findQuery }}>
                    {t('nearbySeeAll', { place })}
                    <ArrowRightIcon aria-hidden />
                </Link>
            </Button>
        </section>
    );
}

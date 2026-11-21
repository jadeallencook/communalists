import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from './field';
import { Input } from './input';

const meta = {
    title: 'Components/Atoms/Field',
    component: Field,
    decorators: [
        (Story) => (
            <div className="max-w-sm">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {
    render: () => (
        <Field>
            <FieldLabel htmlFor="field-location">City or ZIP code</FieldLabel>
            <Input id="field-location" placeholder="e.g. San Jose, CA" />
            <FieldDescription>
                Used to show organizations near you.
            </FieldDescription>
        </Field>
    ),
};

export const WithError: Story = {
    render: () => (
        <Field data-invalid>
            <FieldLabel htmlFor="field-email">Email</FieldLabel>
            <Input id="field-email" aria-invalid defaultValue="not-an-email" />
            <FieldError>Enter a valid email address.</FieldError>
        </Field>
    ),
};

export const Group: Story = {
    render: () => (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="group-name">Name</FieldLabel>
                <Input id="group-name" />
            </Field>
            <Field>
                <FieldLabel htmlFor="group-email">Email</FieldLabel>
                <Input id="group-email" type="email" />
            </Field>
        </FieldGroup>
    ),
};

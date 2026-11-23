import {
    FieldDescription,
    FieldError,
    FieldLegend,
    FieldSet,
} from '@/components/atoms/field';
import { cn } from '@/lib/utils';

export interface ChoiceGroupProps {
    /** Form field name. */
    name: string;
    legend: string;
    options: { value: string; label: string; description?: string }[];
    /** `radio`: pick one. `checkbox`: pick any (submitted as repeated values). */
    kind: 'radio' | 'checkbox';
    /** Uncontrolled initial selection. */
    defaultValue?: string | string[];
    /** Controlled selection (radio only), with onChange. */
    value?: string;
    onChange?: (value: string) => void;
    /** Controlled selection (checkbox only), with onSelectedChange. */
    selected?: string[];
    onSelectedChange?: (selected: string[]) => void;
    /**
     * Checkbox only, with `selected`: once this many are ticked, the others
     * are disabled. The server still enforces it (without JavaScript all
     * boxes stay enabled).
     */
    max?: number;
    hint?: string;
    /** Already-translated error. */
    error?: string;
    /** Lay options out in columns (good for many short options). */
    columns?: boolean;
}

/** A labelled set of native radio buttons or checkboxes. Works without JavaScript. */
export function ChoiceGroup({
    name,
    legend,
    options,
    kind,
    defaultValue,
    value,
    onChange,
    selected,
    onSelectedChange,
    max,
    hint,
    error,
    columns = false,
}: ChoiceGroupProps) {
    const defaults = new Set(
        Array.isArray(defaultValue)
            ? defaultValue
            : defaultValue
              ? [defaultValue]
              : []
    );
    const atMax =
        selected !== undefined && max !== undefined && selected.length >= max;
    const controlProps = (optionValue: string) => {
        if (kind === 'radio' && value !== undefined) {
            return {
                checked: value === optionValue,
                onChange: () => onChange?.(optionValue),
            };
        }
        if (kind === 'checkbox' && selected !== undefined) {
            const checked = selected.includes(optionValue);
            return {
                checked,
                disabled: !checked && atMax,
                onChange: () =>
                    onSelectedChange?.(
                        checked
                            ? selected.filter((v) => v !== optionValue)
                            : [...selected, optionValue]
                    ),
            };
        }
        return { defaultChecked: defaults.has(optionValue) };
    };
    return (
        <FieldSet data-invalid={!!error}>
            <FieldLegend variant="label">{legend}</FieldLegend>
            <div
                className={cn(
                    'grid gap-2',
                    columns ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'
                )}
            >
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm has-[:checked]:border-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                    >
                        <input
                            type={kind}
                            name={name}
                            value={option.value}
                            className="mt-0.5 accent-primary"
                            {...controlProps(option.value)}
                        />
                        <span className="flex flex-col gap-0.5">
                            <span>{option.label}</span>
                            {option.description && (
                                <span className="text-xs text-muted-foreground">
                                    {option.description}
                                </span>
                            )}
                        </span>
                    </label>
                ))}
            </div>
            {error ? (
                <FieldError>{error}</FieldError>
            ) : (
                hint && <FieldDescription>{hint}</FieldDescription>
            )}
        </FieldSet>
    );
}

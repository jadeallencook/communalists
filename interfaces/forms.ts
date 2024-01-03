interface BaseField<T> {
    defaultValue: T;
    label: string;
    required: boolean;
    helpText?: string;
    value?: string;
    test?: (value: string) => boolean;
}

interface StringField extends BaseField<string> {
    type: 'string';
    paragraph: boolean;
    placeholder: string;
}

interface NumberField extends BaseField<number> {
    type: 'number';
    placeholder: string;
}

export type Field = StringField | NumberField;

export interface Stage {
    name: string;
    description: string;
}

export interface Role {
    name: string;
    description: string;
    required: boolean;
}

export interface Form {
    title: string;
    description: string;
    fields: Field[];
    public: boolean;
    live: boolean;
    lastLive: Date;
    lastModified: Date;
    lastModifiedBy: string;
    initialStageId: string;
    stages: { [id: string]: Stage };
    roles: { [id: string]: Role };
}

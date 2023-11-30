interface CustomFormField {
    type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox';
    label: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
}

interface CustomFormStage {
    name: string;
    description?: string;
}

interface CustomFormRole {
    name: string;
    description?: string;
}

interface CustomFormSettings {
    initialStageId?: string;
}

interface CustomForm {
    id: string;
    title: string;
    description?: string;
    fields: CustomFormField[];
    stages: { [id: string]: CustomFormStage };
    roles: { [id: string]: CustomFormRole };
    settings: CustomFormSettings;
}

/**
 * CustomFormField Interface:
 * - type: Standard fields with the ability to add custom types
 * - label: Label displayed to the user over the input
 * - placeholder: Placeholder text displayed in the input
 * - options: Options for fields with a fixed set of values
 * - helpText: Help text displayed in a tooltip
 * - required: Indicates whether the field is required to be filled out
 * - value: Initial value of the field
 */
interface CustomFormField {
    type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox';
    label: string;
    placeholder?: string;
    options?: string[];
    helpText?: string;
    required?: boolean;
    value?: string;
}

/**
 * CustomFormStage Interface:
 * - name: Name of the stage
 * - description: Description of the stage
 */
interface CustomFormStage {
    name: string;
    description?: string;
}

/**
 * CustomFormRole Interface:
 * - name: Name of the role
 * - description: Description of the role
 * - required: Indicates whether the role is required to be filled out
 */
interface CustomFormRole {
    name: string;
    description?: string;
    required?: boolean;
}

/**
 * CustomFormSettings Interface:
 * - initialStageId: Initial stage of the form
 */
interface CustomFormSettings {
    initialStageId?: string;
}

/**
 * CustomForm Interface:
 * - title: H1 title of the form
 * - description: Description of the form
 * - fields: Fields that are displayed to the requester
 * - stages: Stages that the form can be in
 * - roles: Roles that can be assigned to a user
 * - settings: Settings for the form
 */
interface CustomForm {
    title: string;
    description?: string;
    fields: CustomFormField[];
    stages: { [id: string]: CustomFormStage };
    roles: { [id: string]: CustomFormRole };
    settings: CustomFormSettings;
}

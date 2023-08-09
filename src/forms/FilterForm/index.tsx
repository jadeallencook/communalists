import styled, { StyledComponent } from 'styled-components';
import { Button, Form, InputGroup } from 'react-bootstrap';
import style from './style';
import { FormFilterInterface } from '@interfaces/filters';

interface Props {
    className: string;
    filters: FormFilterInterface[];
    setFilters: (value: any) => void;
    refetch: () => void;
    toggleCreate?: () => void;
}

const FilterForm: StyledComponent = styled(
    ({ className, filters, setFilters, refetch, toggleCreate }: Props) => {
        return (
            <Form className={className}>
                <InputGroup>
                    {filters.map(
                        ({
                            name,
                            value,
                            defaultValue,
                            options,
                        }: FormFilterInterface) => (
                            <Form.Select
                                key={name}
                                as="select"
                                name={name}
                                value={value}
                                size="sm"
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        [name]: e.target.value,
                                    }))
                                }
                            >
                                {defaultValue && (
                                    <option value={''}>{defaultValue}</option>
                                )}
                                {Object.entries(options).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </Form.Select>
                        )
                    )}
                    <Button size="sm" variant="secondary" onClick={refetch}>
                        Refresh
                    </Button>
                    {toggleCreate && (
                        <Button size="sm" onClick={toggleCreate}>
                            Create
                        </Button>
                    )}
                </InputGroup>
            </Form>
        );
    }
)(style);

export default FilterForm;

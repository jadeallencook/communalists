import styled, { StyledComponent } from 'styled-components';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FiltersInterface } from '@interfaces/filters';
import style from './style';
import { useContext, useState } from 'react';
import DashboardContext from '../../contexts/DashboardContext';

const AdvancedSearchForm: StyledComponent = styled(
    ({
        className,
        filters,
        setFilters,
        children,
    }: {
        className: string;
        filters: FiltersInterface;
        setFilters: (value: FiltersInterface) => void;
        children?: React.ReactNode;
    }) => {
        const [term, setTerm] = useState<string>('');
        const handleSearch = (e) => {
            setTerm(e.target.value);
            setFilters({ ...filters, searchQuery: e.target.value });
        };

        return (
            <Form className={className}>
                <InputGroup size="sm">
                    <Form.Control
                        type="text"
                        name="driver"
                        value={term}
                        size="sm"
                        placeholder="Search by name or email"
                        onChange={handleSearch}
                    />
                    {children}
                </InputGroup>
            </Form>
        );
    }
)(style);

export default AdvancedSearchForm;

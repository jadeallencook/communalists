import styled, { StyledComponent } from 'styled-components';
import { Button, Form, InputGroup } from 'react-bootstrap';
import languages from '@objects/languages';
import locations from '@objects/locations';
import stages from '@objects/stages';
import { FiltersInterface } from '@interfaces/filters';
import { LanguageKeyType } from '@custom-types/languages';
import { LocationKeyType } from '@custom-types/locations';
import { StageKeyType } from '@custom-types/stages';
import style from './style';
import { DriverKeyType } from '@custom-types/driver';
import drivers from '@objects/drivers';
import { useContext } from 'react';
import DashboardContext from '../../contexts/DashboardContext';

const FilterForm: StyledComponent = styled(
    ({
        className,
        filters,
        setFilters,
        setRefetch,
    }: {
        className: string;
        filters: FiltersInterface;
        setFilters: (value: FiltersInterface) => void;
        setRefetch: (value: boolean) => void;
    }) => {
        const { location, language, driver, stage, coordinator } = filters;
        const { fetchRequests, uid } = useContext(DashboardContext);
        return (
            <Form className={className}>
                <InputGroup>
                    {/* <Form.Select
                        as="select"
                        name="locations"
                        value={location}
                        size="sm"
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                location: e.target.value as LocationKeyType,
                            })
                        }
                    >
                        <option value={''}>Any Location</option>
                        {Object.entries(locations).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select> */}
                    {/* <Form.Select
                        as="select"
                        name="languages"
                        value={language}
                        size="sm"
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                language: e.target.value as LanguageKeyType,
                            })
                        }
                    >
                        <option value={''}>Any Language</option>
                        {Object.entries(languages).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select> */}
                    <Form.Select
                        as="select"
                        name="driver"
                        value={driver}
                        size="sm"
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                driver: e.target.value as DriverKeyType,
                            })
                        }
                    >
                        <option value={''}>Any Delivery</option>
                        {Object.entries(drivers).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        as="select"
                        name="stages"
                        value={stage}
                        size="sm"
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                stage: e.target.value as StageKeyType,
                            })
                        }
                    >
                        {Object.entries(stages).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </Form.Select>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            setFilters({
                                ...filters,
                                coordinator: filters.coordinator ? '' : uid,
                            });
                        }}
                    >
                        <span className="tablet-remove">Only</span> Yours
                    </Button>
                    <InputGroup.Checkbox
                        checked={coordinator}
                        aria-label="view only the requests you are coordinating or driving"
                        onChange={() => {
                            setFilters({
                                ...filters,
                                coordinator: filters.coordinator ? '' : uid,
                            });
                        }}
                    />
                    <Button size="sm" onClick={() => fetchRequests()}>
                        Refresh
                    </Button>
                </InputGroup>
            </Form>
        );
    }
)(style);

export default FilterForm;

import styled, { StyledComponent } from 'styled-components';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import languages from '@objects/languages';
import locations from '@objects/locations';
import stages from '@objects/stages';
import { FiltersType } from '@custom-types/filters';
import { LanguageTypes } from '@custom-types/languages';
import { LocationType } from '@custom-types/locations';
import { StageType } from '@custom-types/stages';
import style from './style';
import { DriverTypes } from '@custom-types/driver';
import drivers from '@objects/drivers';

const FilterForm: StyledComponent = styled(({
    className,
    filters,
    setFilters,
    setRefetch
}: {
    className: string,
    filters: FiltersType,
    setFilters: (value: FiltersType) => void,
    setRefetch: (value: boolean) => void
}) => {
    return (
        <Form className={className}>
            <Container>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Select
                                as="select"
                                name="locations"
                                value={filters.location}
                                size="sm"
                                onChange={e => setFilters({
                                    ...filters,
                                    location: e.target.value as LocationType
                                })}
                            >
                                <option value={''}>Location</option>
                                {
                                    Object.entries(locations).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Select
                                as="select"
                                name="languages"
                                value={filters.language}
                                size="sm"
                                onChange={e => setFilters({
                                    ...filters,
                                    language: e.target.value as LanguageTypes
                                })}
                            >
                                <option value={''}>Language</option>
                                {
                                    Object.entries(languages).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Select
                                as="select"
                                name="driver"
                                value={filters.driver}
                                size="sm"
                                onChange={e => setFilters({
                                    ...filters,
                                    driver: e.target.value as DriverTypes
                                })}
                            >
                                <option value={''}>Driver</option>
                                {
                                    Object.entries(drivers).map(([key, value]) => (
                                        <option key={key} value={value}>{value}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Select
                                as="select"
                                name="stages"
                                value={filters.stage}
                                size="sm"
                                onChange={e => setFilters({
                                    ...filters,
                                    stage: e.target.value as StageType
                                })}
                            >
                                <option value={''}>Stage</option>
                                {
                                    Object.entries(stages).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Button size="sm" onClick={() => setRefetch(true)}>Apply Filters</Button>
                    </Col>
                </Row>
            </Container>
        </Form>
    );
})(style);

export default FilterForm;

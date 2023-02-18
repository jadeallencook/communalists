import styled, { StyledComponent } from 'styled-components';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
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

const FilterForm: StyledComponent = styled(({
    className,
    filters,
    setFilters,
    setRefetch
}: {
    className: string,
    filters: FiltersInterface,
    setFilters: (value: FiltersInterface) => void,
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
                                    location: e.target.value as LocationKeyType
                                })}
                            >
                                <option value={''}>Any Location</option>
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
                                    language: e.target.value as LanguageKeyType
                                })}
                            >
                                <option value={''}>Any Language</option>
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
                                    driver: e.target.value as DriverKeyType
                                })}
                            >
                                <option value={''}>Any Driver</option>
                                {
                                    Object.entries(drivers).map(([key, value]) => (
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
                                name="stages"
                                value={filters.stage}
                                size="sm"
                                onChange={e => setFilters({
                                    ...filters,
                                    stage: e.target.value as StageKeyType
                                })}
                            >
                                <option value={''}>Any Stage</option>
                                {
                                    Object.entries(stages).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Button size="sm" onClick={() => setRefetch(true)}>
                            Apply <span className="tablet-remove">Filters</span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </Form>
    );
})(style);

export default FilterForm;

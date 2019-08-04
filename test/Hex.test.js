import Hex from './../src/Hex.js';

let hex;

beforeEach(() => {
    hex = new Hex();
    hex.createRoom('start', true);
});

describe('Hex', () => {
    describe('getEntities', () => {
        test('Returns all entities when no filter is given.', () => {
            hex.createEntity();
            hex.createEntity();
            expect(Object.keys(hex.getEntities()).length).toEqual(2);
        });

        test('Returns the correct entities for a positive filter.', () => {
            hex.createEntity({
                player: true,
                creature: true,
            });
            hex.createEntity({
                enemy: true,
                creature: true,
            });
            hex.createEntity({
                enemy: true,
                creature: false,
            });
            expect(Object.keys(hex.getEntities({
                enemy: true,
            })).length).toEqual(2);
            expect(Object.keys(hex.getEntities({
                creature: true,
            })).length).toEqual(2);
        });

        test('Returns the correct entities for a negative filter.', () => {
            hex.createEntity({
                player: true,
                creature: true,
            });
            hex.createEntity({
                enemy: true,
                creature: true,
            });
            hex.createEntity({
                enemy: true,
                creature: false,
            });
            expect(Object.keys(hex.getEntities({
                enemy: false,
            })).length).toEqual(1);
            expect(Object.keys(hex.getEntities({
                creature: false,
            })).length).toEqual(1);
        });

        test('Returns the correct entities for a function filters.', () => {
            hex.createEntity({
                health: 10,
            });
            hex.createEntity({
                health: 5,
            });
            expect(Object.keys(hex.getEntities({
                health: (currentHealth) => { return currentHealth > 5; },
            })).length).toEqual(1);
        });

        test('Returns an empty array when no entities are found.', () => {
            expect(Object.keys(hex.getEntities()).length).toEqual(0);

            hex.createEntity({creature: true, health: 4});
            expect(Object.keys(hex.getEntities({ health: (value) => value < 3 })).length).toEqual(0);
        });

        test('Returns an empty array when applying a positive filter for a nonexistant component.', () => {
            hex.createEntity({
                player: true,
            });
            hex.createEntity({
                enemy: true,
            });
            expect(Object.keys(hex.getEntities({
                structure: true,
            })).length).toEqual(0);
        });

        test('Returns all entities when applying a negative filter for a nonexistant component.', () => {
            hex.createEntity({
                player: true,
            });
            hex.createEntity({
                enemy: true,
            });
            expect(Object.keys(hex.getEntities({
                structure: false,
            })).length).toEqual(2);
        });

        test('Throws an error when `entityFilter` is not an object.', () => {
            expect(() => { hex.getEntities('position') }).toThrow();
            expect(() => { hex.getEntities(() => 'position') }).toThrow();
            expect(() => { hex.getEntities(12) }).toThrow();
            expect(() => { hex.getEntities(['position']) }).toThrow();
            expect(() => { hex.getEntities(null) }).toThrow();
        });
    });

    describe('setComponentForEntity', () => {
        test('Creates a component category with the component value for the entity.', () => {
            let entity = hex.createEntity();
            hex.setComponentForEntity('health', 5, entity.id);
            expect(hex.state.componentsMap['health'][entity.id]).toEqual(5);
        });

        test('Throws an error if entity with given ID doesn\'t exist.', () => {
            expect(() => { hex.setComponentForEntity('health', 5, 'abc') }).toThrow();
        });
    });

    describe('getValueOfComponentForEntity', () => {
        test('Creates a component category with the component value for the entity.', () => {
            let entity = hex.createEntity({
                'health': 5,
            });
            expect(hex.getValueOfComponentForEntity('health', entity.id)).toEqual(5);
        });

        test('Throws an error if entity with given ID doesn\'t exist.', () => {
            expect(() => { hex.getValueOfComponentForEntity('health', 'abc') }).toThrow();
        });
    });
});

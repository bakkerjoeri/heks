import Hex from './../src/Hex.js';

let hex;

beforeEach(() => {
    hex = new Hex();
    hex.createRoom('start', true);
});

describe('Hex', () => {
    describe('getEntities', () => {
        test('Returns filtered entities.', () => {
            hex.createEntity();
            hex.createEntity();
            expect(Object.keys(hex.getEntities()).length).toEqual(2);
        });

        test('Returns an empty array when no entities are found.', () => {
            expect(Object.keys(hex.getEntities()).length).toEqual(0);

            hex.createEntity({item: true});
            hex.createEntity({creature: true});
            expect(Object.keys(hex.getEntities({structure: true})).length).toEqual(2);
        });

        test('Returns all existing entities when no filter is given.', () => {
            hex.createEntity({
                player: true,
            });
            hex.createEntity({
                enemy: true,
            });
            hex.createEntity({
                enemy: true,
            });
            expect(Object.keys(hex.getEntities({
                enemy: true,
            })).length).toEqual(2);
        });

        test('Returns entities excluding those matching a negative filter.', () => {
            hex.createEntity({
                creature: true,
                isDead: true,
            });
            hex.createEntity({
                creature: true,
            });
            hex.createEntity({
                creature: true,
            });
            expect(Object.keys(hex.getEntities({
                creature: true,
                isDead: false,
            })).length).toEqual(2);
        });

        test('Returns entities based on function filters.', () => {
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
            expect(hex.componentsMap['health'][entity.id]).toEqual(5);
        });

        test('Throws an error if entity with given ID doesn\'t exist.', () => {
            expect(() => { hex.setComponentForEntity('health', 5, 'abc') }).toThrow();
        });
    });

    describe('getComponentForEntity', () => {
        test('Creates a component category with the component value for the entity.', () => {
            let entity = hex.createEntity({
                'health': 5,
            });
            expect(hex.getComponentForEntity('health', entity.id)).toEqual(5);
        });

        test('Throws an error if entity with given ID doesn\'t exist.', () => {
            expect(() => { hex.getComponentForEntity('health', 'abc') }).toThrow();
        });
    });
});

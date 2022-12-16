import locationMap from './location-map';

test('locations keys should end with state', () => {
	Object.keys(locationMap).map((state) => {
		const value = state.toLocaleLowerCase();
		Object.keys(locationMap[state]).map((key) => {
			expect(key).toContain(`-${value}`);
		});
	});
});

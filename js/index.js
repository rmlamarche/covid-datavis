var dataScale;

const config = {
	map: {
		fill: '#fff',
		stroke: '#000'
	},
	data: {
		fill: '#3F7FF2',
		stroke: '#000'
	},
	currentDate: '2021-02-13'
}

function drawStates(svg, path, states, data) {
	svg.append('g')
		.selectAll('path')
		.data(states.features)
		.enter()
		.append('path')
		.attr('d', path)
		.style('stroke', config.map.stroke)
		.style('stroke-width', '1')
		.attr('fill', config.map.fill);
	
	svg.append('g')
		.selectAll('path')
		.data(states.features.filter(d => data.some(cd => cd.stateName === d.properties.name)))
		.enter()
		.append('path')
		.attr('d', path)
		.style('stroke', config.data.stroke)
		.style('stroke-width', '1')
		.attr('fill', config.data.fill)
		.attr('transform', d => {
			const cd = data.find(cd => cd.stateName === d.properties.name);
			const [x, y] = path.centroid(d);
			return `
				translate(${x},${y})
				scale(${parseInt(cd.positive) / cd.totalPopulation})
				translate(${-x},${-y})
			`;
		});
}

window.addEventListener('load', async function() {

	const svg = d3.select('#map');
	const { clientWidth: width, clientHeight: height } = document.body;
	const projection = d3.geoAlbersUsa();
	const path = d3.geoPath(projection);

	svg.attr('width', width).attr('height', height);
	projection.translate([width / 2, height / 2]).scale([1000]);

	const states = await d3.json('data/geojson/us-states.json');
	console.log(states);

	const abbr = await d3.json('data/state-abbreviations.json');
	console.log(abbr);

	const populations = await d3.csv('data/state-populations.csv');
	console.log(populations);

	const data = await d3.csv('data/covidtracking/all-states-history.csv')
	console.log(data[0]);
	const currentData = data.filter(d => d.date === config.currentDate && d.death.length && d.state !== 'PR').map(d => ({
		...d,
		stateName: abbr[d.state],
		totalPopulation: parseInt(populations.find(p => p['state/region'] === d.state && p.ages === 'total')?.population || 5000000)
	}));
	
	console.log(currentData);

	dataScale = d3.scaleLinear().domain(d3.extent(currentData.map(d => d.death))).range([0, 1]);
	
	drawStates(svg, path, states, currentData);
});

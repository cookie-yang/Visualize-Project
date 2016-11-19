var pcz;
var zcolorscale = d3.scale.linear()
	.domain([-2,-0.5,0.5,2])
	.range(["brown", "#999", "#999", "steelblue"])
	.interpolate(d3.interpolateLab);

// load csv file and create the chart
d3.csv('test2-3.csv', function(raw_data) {
	pcz = d3.parcoords()("#example")
		.data(raw_data)
		.bundlingStrength(0)
		.smoothness(0.05)
		.hideAxis(["Movie","dFBlike","Director","Actor1","Actor2","Actor3","win","D","As","Ac"])
		.showControlPoints(false)
		.composite("darker")
		.alpha(0.35)
		.mode("queue")
		.render()
		.reorderable()
		.brushMode("1D-axes")  // enable brushing
		.interactive()  // command line mode

	change_color("Gross(M)");
	//click label to activate coloring
	pcz.svg.selectAll(".dimension")
		.on("click", change_color)
		.selectAll(".label")
		.style("font-size", "14px");

	// var explore_count = 0;
	// var exploring = {};
	// var explore_start = false;
	// pcz.svg
	//     .selectAll(".dimension")
	//     .style("cursor", "pointer")
	//     .on("click", function(d) {
	//         exploring[d] = d in exploring ? false : true;
	//         event.preventDefault();
	//         if (exploring[d]) d3.timer(explore(d,explore_count));
	//     });

	// function explore(dimension,count) {
	//     if (!explore_start) {
	//         explore_start = true;
	//         d3.timer(pcz.brush);
	//     }
	//     var speed = (Math.round(Math.random()) ? 1 : -1) * (Math.random()+0.5);
	//     return function(t) {
	//         if (!exploring[dimension]) return true;
	//         var domain = pcz.yscale[dimension].domain();
	//         var width = (domain[1] - domain[0])/4;

	//         var center = width*1.5*(1+Math.sin(speed*t/1200)) + domain[0];

	//         pcz.yscale[dimension].brush.extent([
	//             d3.max([center-width*0.01, domain[0]-width/400]),
	//             d3.min([center+width*1.01, domain[1]+width/100])
	//         ])(pcz.g()
	//             .filter(function(d) {
	//                 return d == dimension;
	//             })
	//         );
	//     };
	// };

	var grid = d3.divgrid();
	grid.columns(["Movie","Gross(M)","Budget(M)","Rate","Director","Actor1","Actor2","Actor3"])
	d3.select("#grid")
		.datum(raw_data.slice(0,10))
		.call(grid)
		.selectAll(".row")
		.on({
			"mouseover": function(d) { pcz.highlight([d]) },
			"mouseout": pcz.unhighlight
		});

	pcz.on("brush", function(d) {
		d3.select("#grid")
			.datum(d.slice(0,10))
			.call(grid)
			.selectAll(".row")
			.on({
				"mouseover": function(d) { pcz.highlight([d]) },
				"mouseout": pcz.unhighlight
			});
	});
});

function change_color(dimension) {
	pcz.svg.selectAll(".dimension")
		.style("font-weight", "normal")
		.filter(function(d) { return d == dimension; })
		.style("font-weight", "bold")

	pcz.color(zcolor(pcz.data(),dimension)).render()
};
// return color function based on plot and dimension
function zcolor(col, dimension) {
	var z = zscore(_(col).pluck(dimension).map(parseFloat))
	return function(d) { return zcolorscale(z(d[dimension])) }
};

// color by zscore
function zscore(col) {
	var n = col.length,
		mean = _(col).mean(),
		sigma = _(col).stdDeviation();
	return function(d) {
		return (d-mean)/sigma;
	};
};

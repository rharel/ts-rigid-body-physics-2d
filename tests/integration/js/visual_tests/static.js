(function()
{
	const VIEWPORT =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	testing.register
	({
		title: "Static Single",

		get viewport() { return VIEWPORT; },

		setup: function(Physics)
		{
			const world = new Physics.World();
			const disc = world.spawn(1, 2.5);
			disc.is_static = true;
			disc.body.position = new Physics.Vector(5, 5);
			disc.style =
			{
				fill: FillStyle.Wireframe,
				line_width: 0.1,
				color: "blue"
			};
			return world;
		}
	});
})();

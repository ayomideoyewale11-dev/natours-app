export const displayMap = (locations) => {
  const map = new mapboxgl.Map({
    accessToken:
      'pk.eyJ1IjoiYXlvLTI5MDgiLCJhIjoiY210NzYzajZjMHRvMzJ3c2g4aTNpY3NueiJ9.TWIHChsLrohT1QwQftj86A',
    container: 'map',
    style: 'mapbox://styles/ayo-2908/cmt9odus300g601shhjg93as5',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

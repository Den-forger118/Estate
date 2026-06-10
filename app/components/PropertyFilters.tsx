"use client";

import { useMemo, useState } from "react";
import { formatGhs, properties } from "../data/site";
import { PropertyCard } from "./Cards";

export function PropertyFilters() {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("900000");
  const [beds, setBeds] = useState("Any");
  const [type, setType] = useState("Any");
  const [location, setLocation] = useState("Any");
  const [availability, setAvailability] = useState("Any");

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const textMatch = `${property.name} ${property.type} ${property.location}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const priceMatch = property.priceValue <= Number(maxPrice);
      const bedMatch = beds === "Any" || property.beds >= Number(beds);
      const typeMatch = type === "Any" || property.type === type;
      const locationMatch = location === "Any" || property.location === location;
      const availabilityMatch = availability === "Any" || property.availability === availability;

      return textMatch && priceMatch && bedMatch && typeMatch && locationMatch && availabilityMatch;
    });
  }, [availability, beds, location, maxPrice, query, type]);

  const types = ["Any", ...Array.from(new Set(properties.map((property) => property.type)))];
  const locations = ["Any", ...Array.from(new Set(properties.map((property) => property.location)))];
  const availabilityOptions = ["Any", ...Array.from(new Set(properties.map((property) => property.availability)))];

  return (
    <section className="section properties-page">
      <div className="filter-panel properties-filter-panel">
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or location" />
        </label>
        <label className="properties-price-filter">
          <span className="properties-price-label">
            Max price: <strong className="font-data-md">{formatGhs(Number(maxPrice))}</strong>
          </span>
          <input type="range" min="300000" max="900000" step="25000" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
        </label>
        <label>
          Bedrooms
          <select value={beds} onChange={(event) => setBeds(event.target.value)}>
            {["Any", "3", "4", "5"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Property type
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {types.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            {locations.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Availability
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            {availabilityOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="results-line">{filtered.length} residences match your search</div>
      <div className="property-grid properties-listing">
        {filtered.map((property) => (
          <PropertyCard key={property.slug} property={property} />
        ))}
      </div>
    </section>
  );
}

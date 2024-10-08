// src/pages/Resultados.tsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AnimalCard from '../../components/cards/AnimalCard';
import { Pet } from '../../interfaces/Pet';
import { getAllPets } from '../../api/pets';
import { fetchCenterDetail } from '../../api/centerDetail';
import LoadingSpinner from '../../components/others/LoadingSpinner'; // Ajusta la ruta según la ubicación de tu componente

interface LocationState {
  search: string;
  animal: string;
}

const Resultados: React.FC = () => {
  const location = useLocation();
  const { search, animal } = location.state as LocationState;

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPetsData = async () => {
      try {
        const allPets = await getAllPets();

        // Filtrar por búsqueda y/o animal
        const filteredPets = await Promise.all(
          allPets.map(async (pet) => {
            const center = await fetchCenterDetail(pet.centerId);

            if (center) {
              // Compara el valor de búsqueda con estado, ciudad y código postal
              const matchState = search ? center.city.state.name.toLowerCase() === search.toLowerCase() : true;
              const matchCity = search ? center.city.name.toLowerCase() === search.toLowerCase() : true;
              const matchPostalCode = search ? center.postalCode === search : true;

              // Compara con al menos uno de los campos
              if (matchState || matchCity || matchPostalCode) {
                return animal ? (pet.species === animal ? pet : null) : pet;
              }
            }
            return null;
          })
        );

        // Filtrar resultados no nulos
        const finalFilteredPets = filteredPets.filter((pet) => pet !== null);

        setPets(finalFilteredPets as Pet[]);
      } catch (err) {
        setError('Failed to fetch pets data');
      } finally {
        setLoading(false);
      }
    };

    fetchPetsData();
  }, [search, animal]);

  return (
    <div className="w-full flex flex-col items-center p-6">
      {/* Mostrar el componente de carga mientras se está cargando */}
      <LoadingSpinner loading={loading} />

      {error && <div className="text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="w-full p-6 bg-white shadow-md rounded-lg mb-6">
            <h1 className="text-2xl font-bold mb-4">Resultados de la búsqueda</h1>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <div key={pet.petId} className="w-full">
                  <AnimalCard pet={pet} />
                </div>
              ))
            ) : (
              <p>No se encontraron resultados para tu búsqueda.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Resultados;

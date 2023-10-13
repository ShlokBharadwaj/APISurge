import React, { useState, useEffect } from 'react';

const UserDataTable = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const maxRetries = 4;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        const results = data.filter((user) =>
            Object.values(user)
                .join(' ')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
    }, [data, searchTerm]);

    const fetchData = async (retryCount) => {
        try {
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const jsonData = await response.json();
            setData(jsonData);
            setLoading(false);
        } catch (err) {
            if (retryCount > 0) {
                setTimeout(() => fetchData(retryCount - 1), 2000);
            } else {
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData(maxRetries);
    }, []);

    const [showDetails, setShowDetails] = useState({});

    const handleDetailsToggle = (id) => {
        setShowDetails((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="m-4 overflow-x-auto">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="block mx-auto my-4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
            />
            {loading ? (
                <div className="text-center text-2xl font-bold">Loading...</div>
            ) : error ? (
                <div className="text-center text-2xl font-bold text-red-500">Error: {error}</div>
            ) : (
                <table className="table-auto w-full rounded-lg overflow-hidden">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 bg-gray-100">ID</th>
                            <th className="px-4 py-2 bg-gray-100">Name</th>
                            <th className="px-4 py-2 bg-gray-100">Username</th>
                            <th className="px-4 py-2 bg-gray-100">Email</th>
                            <th className="px-4 py-2 bg-gray-100">Details</th>
                        </tr>
                    </thead>
                    <tbody className='border rounded'>
                        {(searchTerm ? searchResults : data).map((user) => (
                            <tr key={user.id} className="text-center">
                                <td className="border px-4 py-2">{user.id}</td>
                                <td className="border px-4 py-2">{user.name}</td>
                                <td className="border px-4 py-2">{user.username}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">
                                    {showDetails[user.id] ? (
                                        <div>
                                            <p className="text-sm"><span className="font-bold">Phone:</span> {user.phone}</p>
                                            <p className="text-sm"><span className="font-bold">Website:</span> {user.website}</p>
                                            <p className="text-sm"><span className="font-bold">Address:</span> {user.address.street}, {user.address.suite}, {user.address.city}, {user.address.zipcode}</p>
                                            <p className="text-sm"><span className="font-bold">Company:</span> {user.company.name}, {user.company.catchPhrase}, {user.company.bs}</p>
                                            <button
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2"
                                                onClick={() => handleDetailsToggle(user.id)}
                                            >
                                                Hide Details
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2"
                                            onClick={() => handleDetailsToggle(user.id)}
                                        >
                                            More Details
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserDataTable;

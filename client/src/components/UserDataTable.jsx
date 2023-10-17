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
        const results = data.filter((user) => {
            const searchableFields = [
                'name',
                'username',
                'email',
                'phone',
                'website',
                'address',
                'company',
            ];

            return searchableFields.some((field) => {
                if (typeof user[field] === 'object') {
                    return Object.values(user[field])
                        .join(' ')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                } else {
                    return String(user[field])
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                }
            });
        });

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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleDetailsToggle = (id) => {
        setShowDetails((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const highlightText = (text, searchTerm) => {
        const lowerText = text.toLowerCase();
        const lowerSearchTerm = searchTerm.toLowerCase();
        const startIndex = lowerText.indexOf(lowerSearchTerm);
        if (startIndex !== -1) {
            const endIndex = startIndex + lowerSearchTerm.length;
            return (
                <span>
                    {text.substring(0, startIndex)}
                    <span className="bg-yellow-200">{text.substring(startIndex, endIndex)}</span>
                    {text.substring(endIndex)}
                </span>
            );
        }
        return text;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = (searchTerm ? searchResults : data).slice(indexOfFirstItem, indexOfLastItem);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil((searchTerm ? searchResults : data).length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="m-4 overflow-x-auto">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="block mx-auto my-4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                autoFocus
            />
            {loading ? (
                <div className="text-center text-2xl font-bold">Loading...</div>
            ) : error ? (
                <div className="text-center text-2xl font-bold text-red-500">Error: {error}</div>
            ) : (
                <div>
                    <table className="table-auto w-full rounded-lg overflow-hidden">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 bg-gray-100">ID</th>
                                <th className="px-4 py-2 bg-gray-100">Name</th>
                                <th className="px-4 py-2 bg-gray-100">UserName</th>
                                <th className="px-4 py-2 bg-gray-100">Email</th>
                                <th className="px-4 py-2 bg-gray-100">Details</th>
                            </tr>
                        </thead>
                        <tbody className="border rounded">
                            {currentItems.map((user) => (
                                <tr key={user.id} className="text-center">
                                    <td className="border px-4 py-2">{user.id}</td>
                                    <td className="border px-4 py-2">{highlightText(user.name, searchTerm)}</td>
                                    <td className="border px-4 py-2">{highlightText(user.username, searchTerm)}</td>
                                    <td className="border px-4 py-2">{highlightText(user.email, searchTerm)}</td>
                                    <td className="border px-4 py-2">
                                        {showDetails[user.id] ? (
                                            <div>
                                                <p className="text-sm">
                                                    <span className="font-bold">Phone:</span>{' '}
                                                    {highlightText(user.phone, searchTerm)}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-bold">Website:</span>{' '}
                                                    {highlightText(user.website, searchTerm)}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-bold">Address:</span>{' '}
                                                    {highlightText(user.address.street, searchTerm)},{' '}
                                                    {highlightText(user.address.suite, searchTerm)},{' '}
                                                    {highlightText(user.address.city, searchTerm)},{' '}
                                                    {highlightText(user.address.zipcode, searchTerm)}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-bold">Company:</span>{' '}
                                                    {highlightText(user.company.name, searchTerm)},{' '}
                                                    {highlightText(user.company.catchPhrase, searchTerm)},{' '}
                                                    {highlightText(user.company.bs, searchTerm)}
                                                </p>
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
                    <div className="flex justify-center mt-4">
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className="mx-1 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                            >
                                {number}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDataTable;

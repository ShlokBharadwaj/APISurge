import React, { useState, useEffect, useRef } from 'react';

const UserDataTable = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const maxRetries = 4;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchInput = useRef(null);

    const [sortConfig, setSortConfig] = useState(null);

    const sortedData = React.useMemo(() => {
        if (sortConfig !== null) {
            const sortedArray = data.slice().sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            return sortedArray;
        }
        return data;
    }, [data, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === '/') {
                event.preventDefault();
                searchInput.current.focus();
            }
        };

        document.addEventListener('keypress', handleKeyPress);
        return () => {
            document.removeEventListener('keypress', handleKeyPress);
        };
    }, []);

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

    const currentItems = React.useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return (searchTerm ? searchResults : sortedData).slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, itemsPerPage, searchTerm, searchResults, sortedData]);

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
                ref={searchInput}
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
                                <th className="px-4 py-2 bg-gray-100 cursor-pointer" onClick={() => requestSort('id')}>ID {sortConfig && sortConfig.key === 'id' && (
                                    <span>{sortConfig.direction === 'ascending' ? '⬆️' : '⬇️'}</span>
                                )}
                                    {!sortConfig && (
                                        <span>⬆️</span>
                                    )}</th>
                                <th className="px-4 py-2 bg-gray-100 cursor-pointer" onClick={() => requestSort('name')}>Name {sortConfig && sortConfig.key === 'name' && (
                                    <span>{sortConfig.direction === 'ascending' ? '⬆️' : '⬇️'}</span>
                                )}</th>
                                <th className="px-4 py-2 bg-gray-100 cursor-pointer" onClick={() => requestSort('username')}>UserName {sortConfig && sortConfig.key === 'username' && (
                                    <span>{sortConfig.direction === 'ascending' ? '⬆️' : '⬇️'}</span>
                                )}</th>
                                <th className="px-4 py-2 bg-gray-100 cursor-pointer" onClick={() => requestSort('email')}>Email {sortConfig && sortConfig.key === 'email' && (
                                    <span>{sortConfig.direction === 'ascending' ? '⬆️' : '⬇️'}</span>
                                )}</th>
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
                                                    className="bg-white hover:bg-gray-100 text-black border border-gray-400 font-bold py-2 px-4 rounded my-2"
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
                                className={`mx-1 px-4 py-2 ${number === currentPage
                                    ? 'bg-white hover:bg-gray-100 text-black border border-gray-400'
                                    : 'bg-blue-500 hover:bg-blue-700 text-white'
                                    } font-bold rounded`}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                </div>
            )}
            <div
                className="fixed bottom-4 right-4 text-gray-800 p-4 ml-4 rounded-md"
            >
                <span className='text-yellow-400'>💡ProTip!</span> Press the <span className='text-yellow-400'>/</span> key to activate the search input again and adjust your query.
            </div>
        </div>
    );
};

export default UserDataTable;

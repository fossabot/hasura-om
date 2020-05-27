const axios = require('axios');
const __ = require('../utils/helpers');

class Gql {
	constructor(parameters) {
		const defaultParameters = {
			graphqlUrl: null,
			adminSecret: null,
			settings: {},
		};
		this.params = __.mergeDeep({}, defaultParameters, parameters);

		if (!this.params.graphqlUrl) {
			throw new Error('graphqlUrl is required');
		}

		if (typeof this.params.graphqlUrl !== 'string') {
			throw new TypeError('graphqlUrl must be Url format');
		}

		if (!this.params.adminSecret) {
			throw new Error('adminSecret is required');
		}

		this.$http = axios.create({
			baseURL: this.params.graphqlUrl,
			headers: {
				'Content-Type': 'application/json',
				'X-Hasura-Role': 'admin',
				'x-hasura-admin-secret': this.params.adminSecret,
			},
			json: true,
		});
	}

	async run({query, variables}) {
		const [err, {data} = {}] = await __.to(
			this.$http.request({
				method: 'POST',
				data: {
					query,
					variables,
				},
			}),
		);
		if (err) {
			return [err];
		}

		if (data.errors) {
			return [new Error(data.errors[0].message)];
		}

		return [null, data.data];
	}
}

module.exports = Gql;

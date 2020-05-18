// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SignupEmail from 'components/signup/signup_email/signup_email.jsx';

import {browserHistory} from 'utils/browser_history';

describe('components/SignupEmail', () => {
    const defaultProps = {
        location: {
            query: {
                token: '9f392f193973g11ggh398h39hg0ghH',
                email: 'test@example.com',
            },
        },
        enableSignUpWithEmail: true,
        siteName: 'Mattermost',
        termsOfServiceLink: '',
        privacyPolicyLink: '',
        customDescriptionText: '',
        passwordConfig: {},
        actions: {
            createUser: jest.fn().mockResolvedValue({data: true}),
            loginById: jest.fn().mockResolvedValue({data: true}),
            setGlobalItem: jest.fn().mockResolvedValue({data: true}),
            getTeamInviteInfo: jest.fn().mockResolvedValue({data: true}),
        },
        hasAccounts: false,
        diagnosticsEnabled: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <SignupEmail {...defaultProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    describe('handleSignupSuccess', () => {
        it('should not redirect with undefined teammname', async () => {
            browserHistory.push = jest.fn();

            const wrapper = shallow(
                <SignupEmail
                    {...defaultProps}
                    actions={{
                        ...defaultProps.actions,
                        loginById: jest.fn().mockImplementation(() => {
                            const error = {
                                server_error_id: 'api.user.login.not_verified.app_error',
                            };

                            return Promise.resolve({error});
                        }),
                    }}
                />
            );

            await wrapper.instance().handleSignupSuccess({email: 'test@example.com', password: 'bar'}, {id: 'foo'});
            expect(browserHistory.push).toHaveBeenCalledWith('/should_verify_email?email=test%40example.com');
        });

        it('should redirect with teammname if present in state', async () => {
            browserHistory.push = jest.fn();

            const wrapper = shallow(
                <SignupEmail
                    {...defaultProps}
                    actions={{
                        ...defaultProps.actions,
                        loginById: jest.fn().mockImplementation(() => {
                            const error = {
                                server_error_id: 'api.user.login.not_verified.app_error',
                            };

                            return Promise.resolve({error});
                        }),
                    }}
                />
            );

            wrapper.setState({teamName: 'sample'});

            await wrapper.instance().handleSignupSuccess({email: 'test@example.com', password: 'bar'}, {id: 'foo'});
            expect(browserHistory.push).toHaveBeenCalledWith('/should_verify_email?email=test%40example.com&teamname=sample');
        });

        it('should set request for signup survey', async () => {
            const email = 'test@example.com';
            const password = 'bar';
            const id = 'foo';

            const props = {
                ...defaultProps
            };

            const wrapper = shallow(
                <SignupEmail {...props}/>
            );

            await wrapper.instance().handleSignupSuccess({email, password, shouldBeSurveyed: true}, {id});
            expect(props.actions.setGlobalItem).toHaveBeenCalledWith('survey_signup', 'foo');
        });
    });
});

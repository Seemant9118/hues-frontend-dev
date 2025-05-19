'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';

const TermsAnsConditionModal = ({ isOpen, onClose, onDecline, onAgree }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[600px] max-w-[800px] flex-col justify-center gap-5">
        <DialogTitle>User Agreement</DialogTitle>
        <div className="navScrollBarStyles flex flex-col gap-2 overflow-y-auto px-2 text-justify text-sm">
          <p>
            {`This Software as a Service Agreement ("Agreement") is entered into
            by and between the Subscriber and the Paraphernalia B2B2B Products
            Private Limited, as of the date the Subscriber starts using Hues.
            This Agreement sets forth the terms and conditions under which a
            Subscriber agrees to use the Provider's application and related
            Services "Hues"/ Service"). By accessing Hues the Subscriber
            acknowledges and agrees to be bound by these terms. If the
            Subscriber does not agree with any provisions of this Agreement, the
            Subscriber may not access or use Hues.`}
          </p>
          {/* definitions */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">1. DEFINITIONS</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`1.1 "Account" refers to any Accounts or instances created by, or on behalf of, Subscriber or its Affiliates within Hues.`}</span>
              <span>{`1.2 "Affiliates" - in relation to a party, an entity that directly or indirectly controls or is controlled by or is under common control with such Party. Including the power to direct, cause direction whether through the ownership of voting securities, by contract, or otherwise.`}</span>
              <span>{`1.3 "Agent" - means an individual authorized to use the Service through Subscriber's Account as an Agent, Account Provider, and/or an administrator.`}</span>

              <span>{`1.4. "Agreement" - refers to this Software as a Service Agreement, including all its annexes, schedules, and amendments.`}</span>

              <span>{`1.5. "Associated Services" - refers to products, services, features and functionality designed to be used in conjunction with the Services that are not included in the subscribed services.`}</span>

              <span>{` 1.6. "Effective Data" - the date on which this Agreement comes into effect and binds both Parties.`}</span>

              <span>{`1.7. "End-User" - refers to any person or entity other than the Subscriber or Agents with whom Subscriber, Agents, or other end-Subscribers interact using the Service.`}</span>

              <span>{`1.8. "Provider" refers to the company or entity that offers the Software and is a Party to this Agreement and may also be referred to as "Us", "We" or "Our".`}</span>

              <span>{`1.9. "Service" - means the products and services that are used or ordered by the Subscriber online through any medium, whether on a trial or paid basis. Including applicable software, updates, API, documentation, and all Associated Services provided under this Agreement. We reserve the right to change the name, prices, and description of the Service.`}</span>

              <span>{`1.10. "Service Data" refers to electronic data, text, messages, communications, or other materials submitted to and stored within a service by the Subscriber, Agents, and End-Subscribers in connection with the use of the service by such Subscribers. This excludes the contact details of the Agent.`}</span>
            </p>
          </div>
          {/* Account Terms */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">2. ACCOUNT TERMS</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`2.1. The Service will be available to you subject to this Agreement and the applicable order(s). Hues use commercially reasonable efforts to make the Service available 24 hours a day and 7 days a week, except during the planned downtime with advance notice to You or the occurrence of a Force Majeure Event. will`}</span>
              <span>{`2.2. The Subscriber agrees that its purchases are not contingent on the delivery of any future functionality or features, or dependent on any oral or written public comments by Hues. features. regarding future functionality or`}</span>
              <span>{`2.3. Hues reserves the right to modify the features and functionality of the Services during the term of the Subscription. In case, if there is a deprecation of any material functionality, Hues will provide an advance notice of 30 (thirty) working days to You.`}</span>

              <span>{`2.4. Access to certain Services is restricted and only an authorized number of people with valid credentials access the Account. The Account credentials of Agent-based Accounts shall not be shared, and a single Account shall not be used by multiple people at the same time.`}</span>

              <span>{`2.5. Subscriber shall not circumvent the limitations set out under this Agreement or order form. In case it is found the Subscriber overused the Services beyond their subscription limit, an additional Service Fee may be charged for such uses.`}</span>

              <span>{`2.6. The provision and use of Hues in certain jurisdictions are subject to Hues Region Specific Terms.`}</span>

              <span>{`2.7. We might provide some or all elements of the Subscription Service through third-party service providers`}</span>

              <span>{` 2.8. If You purchase any additional services or packages from Us, this Agreement will apply to all additional orders and features that you activate within your Hues Account`}</span>

              <span>{`2.9. You must be above the age of majority in the jurisdiction where You reside and from which You use the Services. If You are below such age, you can only use the Service under the supervision of a parent or guardian.`}</span>
            </p>
          </div>

          {/* free and trial subscriptions */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">3. FREE OR TRIAL SUBSCRIPTION</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`3.1. The Subscriber may use certain Services for free for a limited time or on a trial basis. The free service or trial period will be available free of charge until the date on which your free subscription is terminated or the start of your paid subscription, whichever occurs first.`}</span>
              <span>{`3.2. You agree not to use the free services in any manner that exceeds the limit set, including but not limited to storage, user limit, and bandwidth consumption.`}</span>
              <span>{`3.3. We may change the limits to your use of free service at any time at Our sole discretion without notice to you, regardless of whether or not these are used in conjunction with other Subscription Services for which You pay.`}</span>
              <span>{`3.4. Any data the Subscriber or End-User enters into the Service or any customization will be lost once the free period or trial period ends unless the Subscriber exports the data before the expiry of the free period or trial period.`}</span>
            </p>
          </div>

          {/* subscriber obligations */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">4. SUBSCRIBER OBLIGATIONS</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`4.1. Provide true, complete, and up-to-date contact and billing information.`}</span>
              <span>{`4.2. You must keep all your credentials including username and password highly confidential.`}</span>
              <span>{`4.3. You are responsible for maintaining the safety and security of Your identifying information as well as keeping Us apprised of any changes to Your identifying information.`}</span>
              <span>{`4.4. In case, if Your credentials are compromised, You agree to notify Us immediately in writing.`}</span>
              <span>{`4.5. The billing information You provide Us, including credit card, billing address and other payment information, is subject to the same confidentiality and accuracy requirements as the rest of Your identifying information. Providing false or inaccurate information or using Hues or Services to further fraud or unlawful activity is grounds for immediate termination of Your subscription and Account.`}</span>

              <span>{`4.6. Subscriber is responsible for compliance with the provisions of this Agreement by Agents and End- Users and for any and all activities that occur under an Account. Without foregoing, Subscriber will ensure that its use of the Services is in compliance with all applicable laws, regulations, privacy notices, Agreements, and other obligations with the Agents and End-Users.`}</span>

              <span>{`4.7. The Subscriber shall comply with all applicable data protection and privacy laws and regulations when processing and handling any personal data through Hues.`}</span>
              <span>{`4.8. The Subscriber agrees to cooperate with Hues support requests related to resolving any technical issues or addressing any Hues.`}</span>
            </p>
          </div>

          {/* data consent */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">{`4A. DATA CONSENT, DOCUMENT VALIDITY & UPLOAD RESPONSIBILITY`}</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`4A.1. Consent to Data Pulls During Onboarding`}</span>
              <span>{`The onboarding of the Subscriber and/or the enterprise shall be deemed as explicit written consent to authorize all data pulls processed during the onboarding process. This includes the automated and manual retrieval of relevant data by Hues and its affiliated services as part of identity verification, account setup, and functionality enablement. Such consent shall be construed to have been granted voluntarily and with full knowledge of the implications thereof.`}</span>
            </p>

            <p className="flex flex-col gap-2 pl-4">
              <span>{`4A.2. OTP-Endorsed Digital Execution of Documents`}</span>
              <span>{`Every document signed using the Subscriber’s or Agent’s PIN during a given session shall be endorsed by way of the OTP used to initiate that session. This endorsement shall serve as conclusive proof of (a) the Subscriber’s or Agent’s assent to the content of the document, and (b) the existence of requisite authority to execute the document on behalf of the entity or person for whom the Subscriber or Agent is acting. Such documents shall be treated as digitally executed with the same legal effect as physically signed originals.`}</span>
            </p>

            <p className="flex flex-col gap-2 pl-4">
              <span>{`4A.3. Responsibility for Uploaded Attachments`}</span>
              <span>{`All documents uploaded as attachments to the Hues platform shall be deemed to have been uploaded with the explicit consent of the rightful document owner. The uploading Subscriber or Agent shall represent and warrant that they have obtained such consent and possess the authority to share the document. The uploading Subscriber or Agent shall bear sole responsibility and liability for any claims, damages, or disputes arising from such uploads, including but not limited to breach of confidentiality, intellectual property infringement, or unauthorized disclosure.`}</span>
            </p>
          </div>

          {/* acceptable use */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">5. АССЕРТАBLE USE</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`5.1. You agree not to use Hues or Services for any unlawful purpose or any purpose prohibited under this clause. You agree not to use Hues or Services in any way that could damage Hues, Services or general business of the Provider.`}</span>
              <span>{`5.2. You further agree not to use Hues or Services:`}</span>
              <span>{`5.2.1. Engaging in any activity that could result in excessive bandwidth usage, degradation of performance, or disruption of Hues.`}</span>
              <span>{`5.2.2. to use for competitive benchmarking or for developing a competing product or service.`}</span>
              <span>{`5.2.3. To harass, abuse, or threaten others or otherwise violate any person's legal rights,`}</span>
              <span>{`5.2.4. To violate any intellectual property rights of the Provider or any third party,`}</span>
              <span>{`5.2.5. To upload or otherwise disseminate any computer viruses or other software that may damage the property of another,`}</span>
              <span>{`5.2.6. To perpetrate any fraud;`}</span>
              <span>{`5.2.7. To engage in or create any unlawful gambling, sweepstakes, or pyramid scheme`}</span>
              <span>{`5.2.8. To publish or distribute any obscene or defamatory material;`}</span>
              <span>{`5.2.9. To publish or distribute any material that incites violence, hate or discrimination towards any group`}</span>
              <span>{`5.2.10. To unlawfully gather information about others`}</span>
              <span>{`5.3. You are prohibited from using  Hues or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts, (c) to infringe on any third party's intellectual property or proprietary rights, or rights of publicity or privacy, whether knowingly or unknowingly, (d) to violate any local, federal or international law, statute, ordinance or regulation; ((e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability, (f) to submit false or misleading information or any content which is defamatory, libelous, threatening, unlawful, harassing, indecent, abusive, obscene, or lewd and lascivious or pornographic, or exploits minors in any way or assists in human trafficking or content that would violate rights of publicity and/or privacy or that would violate any law, (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of Hues ,other Products, or the Internet; (h) to collect or track the personal information of others; (i) to damage, disable, overburden, or impair Hues or any other party's use of Hues. (j) to spam, phish, the effect of personally threatening other Subscribers. We reserve the right to terminate your use of pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of Hues, other Products, or the Internet; (1) to personally threaten or has the effect of personally threatening other subscribers. We reserve the right to terminate the use of Hues for violating any of the prohibited uses.`}</span>
              <span>{`5.4. You shall not sublicense, resell, or distribute the Service to any third party without prior written consent from the Provider.`}</span>
              <span>{`5.5. You acknowledge that Hues is not responsible or liable and does not control the content of any information that may be posted or stored on Hues by You or other users of Hues and you are solely responsible for the same. You agree that You shall not upload, post, or transmit any content that you do not have a right to make available (such as the intellectual property of another party).`}</span>
              <span>{`5.6. You agree to comply with all applicable laws, statutes and regulations concerning your use of Hues and further agree that you will not transmit any information, data, text, files, links, software, chats, communication or other materials that are abusive, invasive of another's privacy, harassing, defamatory, vulgar, obscene, unlawful, false, misleading, harmful, threatening, hateful or racially or otherwise objectionable, including without limitation material of any kind or nature that encourages conduct that could constitute a criminal offense, give rise to civil liability or otherwise violate any applicable local, state, provincial, national, or international law or regulation, or encourage the use of controlled substances.`}</span>
              <span>{`5.7. You may not use Our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).`}</span>
              <span>{`5.8. You acknowledge that the Service has not been designed to collect or process sensitive personal information and accordingly, you agree not to use the Service to collect, process or store any sensitive information. We will not have, and We specifically disclaim any liability that may result from Your use of the Service to collect, process and store sensitive information.`}</span>
              <span>{`5.9. You shall obtain all necessary consents and permissions from individuals whose personal data is collected or processed through Hues.`}</span>
              <span>{`5.10. Hues reserves the right to monitor the Subscriber's use of Hues terms and applicable laws. to ensure compliance with these`}</span>
              <span>{`5.11. In the event of suspected violation of these terms, applicable laws, and regulations, We investigate and take appropriate actions, including but not limited to warning the Subscriber, suspending, or terminating the Subscriber's access to Hues and reporting any illegal activities to the relevant authorities.`}</span>
            </p>
          </div>

          {/* payment */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">6. PAYMENT & SERVICE FEE</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`6.1. The Subscriber agrees to pay all applicable Service Fees and charges associated with their subscription to Hues as outlined in the service order, statement of work, supplemental terms, or otherwise agreed usage charges.`}</span>
              <span>{`6.2. The Subscriber shall provide valid and up-to-date payment information, such as debit card, credit card, or other approved payment methods, to Hues.`}</span>
              <span>{`6.3. The Subscriber authorizes the Provider to charge the designated payment method for all applicable Service Fees and charges. Subscriber further authorizes Hues to use a third party to process payments and consent to the disclosure of your payment information to such third party.`}</span>

              <span>{`6.4. All Service Fees and charges are exclusive of any applicable taxes, including Goods and Services Tax (GST) or other similar taxes, imposed by the concerned government or authorities. The Subscriber shall be responsible for paying any such taxes as required by applicable laws.`}</span>

              <span>{`6.5. In addition to the Service Fee, the Provider may charge one-time setup Fees, onboarding Fees, or Fees for customization or integrations requested by the Subscriber. The details of such additional Service Fee shall be provided in writing by the Provider and agreed upon by both parties.`}</span>

              <span>{`6.6. If Subscriber chooses to upgrade the Service plan or increase the number of Agents authorized to access and use a Service during the subscription term, any incremental subscription charges associated with such upgrade will be charged in accordance with the remaining subscription term.`}</span>

              <span>{`6.7. Subscriber may not downgrade their subscription plan or reduce the number of Agents during any subscription term. The Subscribers can only downgrade their subscription at the end of the then-current subscription term.`}</span>

              <span>{`6.8. Hues shall issue invoices or payment receipts to the Subscriber for all applicable Service Fees and charges, either electronically or through other agreed-upon means.`}</span>

              <span>{`6.9. The Subscriber shall review invoices promptly upon receipt and notify Hues concerns within a reasonable time frame. of any discrepancies or concerns within a reasonable time frame. `}</span>

              <span>{`6.10. Unless otherwise stated in the pricing section or agreed upon by both parties in writing, all Service Fees and charges shall be payable in advance on a recurring basis.`}</span>
              <span>{`6.11. The payment is due within the specified timeframe from the invoice date or dates mentioned in the purchase order, and failure to make a timely payment may result in suspension or termination of the Subscriber's access to Hues.`}</span>
              <span>{`6.12. All Service Fees and charges are non-refundable, except as expressly provided in this Agreement or required by applicable law.`}</span>
              <span>{`6.13. Hues reserves the right to modify the Service Fee and charges for the Service upon providing the Subscriber with prior notice, which may be in the form of an updated pricing schedule or other written communication. The Service Fee adjustments shall become effective upon the start of the next billing cycle. In the event of a Service Fee increase, the Subscriber may have the option to terminate their subscription upon written notice to Hues before the Effective Date of the Service Fee increase.`}</span>
            </p>
          </div>

          {/* term */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">7. TERM, TERMINATION & SUSPENSION</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`7.1. The term of Service begins with a valid subscription and will remain in effect as long as the Subscriber has a valid subscription, statement of work, or until this Agreement is otherwise terminated in accordance with the terms hereof, whichever occurs first. The term will be defined for each Service order or invoice.`}</span>
              <span>{`7.2. If you have selected a recurring subscription scheme, upon the expiry of an existing plan, an amount equivalent to the Subscription Service Fee will be deducted automatically. If it fails, you shall make the payment within 1 (one) calendar days from the due date, failing to do so, your subscription will be suspended or terminated`}</span>
              <span>{`7.3. Either Party may terminate an Account and subscription to a Service at the end of the then-current Subscription term by providing notice of 7 (seven) calendar days to the other Party. To cancel the subscription, the Subscriber can do the following: `}</span>
              <span>{`Send an email to support@paraphernalia.in to cancel the subscription. Alternatively, go to Account Settings, Plan, and select Cancel Subscription.`}</span>

              <span>{`7.4. The Provider specifically reserves the right to terminate this Agreement if You violate any of the terms outlined herein, including, but not limited to, violating the intellectual property rights of the Provider or a third party, failing to comply with applicable laws or other legal obligations, and/or publishing or distributing illegal material`}</span>

              <span>{`7.5. Either Party can terminate this Agreement if the other Party commits a material breach of these terms, other Agreements, or applicable laws not cured for more than 15 (fifteen) calendar days, if the other Party becomes subject to a petition in bankruptcy, or any other proceedings relating to insolvency, liquidation, or assignment for the benefit of creditors. In case the Subscriber terminates the subscription, in accordance with this clause, the Subscriber will be entitled to a refund of any prepaid Service Fees covering the remainder of the Subscription term. In case, if the Subscription is terminated by Hues in accordance with this clause, the Subscriber must pay any unpaid Service Fees covering the remainder of the Subscription Term.`}</span>

              <span>{`7.6. No refunds or credits for subscription charges, Service Fees or payments will be provided if the Subscriber terminates a subscription to a Service or cancels its Account prior to the end of a Subscription Term (Except when such termination is in accordance with the above clause).`}</span>

              <span>{`7.7. At the termination of this Agreement, any provisions that would be expected to survive termination by their nature shall remain in full force and effect. You will be subject to this Agreement for as long as you have access to Hues.`}</span>

              <span>{`7.8. In case of a paid Subscriber, upon Subscriber's written request, Hues will make Service Data available to Subscriber for export or download for 15 (fifteen) calendar days after the Effective Date of termination, expiration or migration of the Account, except for Service Data deleted in accordance with these terms, or upon violation of applicable laws, or is against the law or legal order. Thereafter, Hues will have no obligation to retain the Service Data unless otherwise stated under applicable laws.`}</span>

              <span>{`7.9. Further terms on data retention/deletion of Subscribers are as follows:`}</span>
              <span>{`Subscriber data will be retained for 30 days after expiry/ cancellation of the subscription. Post this period, all personal information of the subscriber shall be deleted from the Hues servers and an anonymized copy of the data, called transactional data, shall be retained for internal training and quality management purposes.`}</span>
            </p>
          </div>

          {/* privacy info */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">8. PRIVACY INFORMATION</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`8.1. The Provider may collect and process personal information and other data from the Subscriber and its Agents, and End-Users as necessary for the provision of providing the Service. The Provider's privacy policy shall govern the collection and processing of such data. The Subscriber is responsible for reviewing the privacy policy periodically to stay informed of any changes. You can access the privacy policy through the following link: hues.paratech.ai/tos`}</span>
              <span>{`8.2. The Subscriber retains all rights, titles, and interest in and to any data or information submitted, uploaded, or transmitted by the Subscriber or its authorized users through Hues ("End-User Data").`}</span>
              <span>{`8.3. The Subscriber hereby grants the Provider a limited, non-exclusive, worldwide, royalty-free license to process the End-User Data solely for the purpose of providing Hues and fulfilling its obligations under this Agreement and applicable laws.`}</span>

              <span>{`8.4. If you are using the Hues account of another party, then you represent and warrant that you have all sufficient and necessary rights and permissions to do so.`}</span>
            </p>
          </div>

          {/* assumptions */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">9. ASSUMPTION OF RISK</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`9.1. The Subscriber acknowledges that the use of Hues carries certain inherent risks and uncertainties including:`}</span>
              <span>{`9.1.1. Technical risks such as interruptions, delays, or unavailability of Hues software, or network failures. due to hardware,`}</span>
              <span>{`9.1.2. Compatibility risks such as incompatibility between. software, or network environment. and the Subscriber's hardware`}</span>

              <span>{`9.1.3. Security risks, such as unauthorized access, data breaches, or loss of data`}</span>

              <span>{`9.2. By using Hues the Subscriber voluntarily accepts and assumes all risks associated with its use. The Subscriber acknowledges that the Provider shall not be held liable for any damages, losses, or harm arising from or related to the inherent risks of Hues.`}</span>

              <span>{`9.3. Hues and Services are provided for communication purposes only. You acknowledge and agree that any information posted on Hues is not intended to be legal advice, medical advice, or financial advice, and no fiduciary relationship has been created between You and the Provider`}</span>

              <span>{`9.4. You further agree that Your purchase of any of the Service on Hues is at Your own risk. The Provider does not assume responsibility or liability for any advice or other information given on Hues.`}</span>
            </p>
          </div>

          {/* intellectual property */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">10. INTELLECTUAL PROPERTY</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`10.1. You agree that Hues and all Services provided by the Provider are the property of the Provider, including all copyrights, trademarks, trade secrets, patents, and other intellectual property ("Provider IP"). You agree that the Provider owns all rights, title, and interest in and to the Provider IP and that You will not use the Provider IP for any unlawful or infringing purpose. You agree not to reproduce or distribute the Provider IP in any way, including electronically or via registration of any new trademarks, trade names, service marks or Uniform Resource Locators (URLs), without express written permission from the Provider.`}</span>
              <span>{`10.2. You agree not to modify directly or indirectly, copy, reproduce, distribute, display, perform, or create derivative works based on the Provider IP.`}</span>
              <span>{`10.3. You acknowledge and agree that this Agreement does not give you any right to implement Hues patents.`}</span>

              <span>{`10.4. Each Party shall retain all rights, titles, and interests in its respective intellectual property rights. The rights granted to the Subscriber, Agents, and End-Users to use the services under this Agreement do not include any additional rights or intellectual property rights of Hues.`}</span>

              <span>{`10.5. In order to make Hues and Services available to you, you hereby grant the Provider a royalty-free, non-exclusive, worldwide license to copy, display, use, broadcast, transmit and make derivative works of any content You publish, upload, or otherwise make available to Hues (Your Content"). The Provider claims no further proprietary rights in Your Content.`}</span>

              <span>{`10.6. If You come to know about any of Your intellectual property rights have been infringed or otherwise violated by the posting of information or media by another of Our Subscribers, please contact Us and let Us know.`}</span>

              <span>{`10.7. In the event that the Subscriber becomes aware of any infringement or unauthorized use of the Provider IP, the Subscriber shall promptly notify the Provider and provide all necessary assistance to protect the Provider's rights in the Provider IP.`}</span>
            </p>
          </div>

          {/* publicity */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">11. PUBLICITY</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`11.1. The Subscriber grants the Provider the right to use the Subscriber's name, logo, and general description of the nature of the service provided in connection with this Agreement for the purpose of identifying the Subscriber as a customer of the Provider. The Provider may include the Subscriber's name and logo on its website, marketing, and promotional materials.`}</span>
              <span>{`11.2. Whenever the Subscriber requests to make reasonable changes or restrictions on the use of its name and logo, the Provider shall make a commercially reasonable effort to accommodate such requests. Neither party shall make any public statement or press release regarding this Agreement without the prior written consent of the other party, except as required by applicable law or regulation.`}</span>
            </p>
          </div>

          {/* indemnification */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">12. INDEMNIFICATION</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`12.1. Hues will indemnify and defend the Subscriber from and against any claim brought by a third party against the Subscriber alleging Subscriber's use of Service infringes third-party valid intellectual property rights (IP Claim). Hues shall, at Hues' expense defend such IP claim and pay damages finally awarded against Subscriber in connection therewith, provided Subscriber promptly notify Hues of a threat or notice of IP Claim, Hues reserve the exclusive right to defend such claims, Subscriber full cooperates with in connection therewith.`}</span>
              <span>{`12.2. You agree to defend and indemnify the Provider and any of its affiliates (if applicable) and hold Us harmless against any and all legal claims and demands, including reasonable attorney's Fees, which may arise from or relate to Your use or misuse of Hues or Services, Your breach of this Agreement, or Your conduct or actions, Hues will immediately notify the Subscriber of the threat or notice of such a claim. Hues will cooperate with Subscriber in connection with such disputes. You agree that the Provider shall be able to select its own legal counsel and may participate in its own defense if the Provider wishes.`}</span>
            </p>
          </div>

          {/* third party links */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">13. THIRD-PARTY LINKS & CONTENT</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`13.1. Hues may contain links to third-party websites, apps, and resources. The Subscriber acknowledges and agrees that the Provider does not endorse or control such third-party websites, or resources, and the Provider shall not be responsible or liable for any content, advertising, products, or other materials available on such websites or resources.`}</span>
              <span>{`13.2. The Subscriber may choose to integrate third-party applications, plugins, or content ("Third-Party Content") with Hues Third-Party Content is subject to the terms and conditions of respective third parties and the Provider shall not be responsible or liable for any issues related to the use of Third-Party Content. Any concerns or disputes regarding the service, payment or any other matter concerning third-party websites or resources should be addressed directly to the applicable third party.`}</span>
            </p>
          </div>

          {/* modification and variations */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">14. MODIFICATION & VARIATION</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`14.1. The Provider may, from time to time and at any time modify this Agreement. We will provide you with reasonable advance notice of changes to this Agreement that materially adversely affect your use of the Service or your rights through email or by notification or any other similar methods`}</span>
              <span>{`14.2. If the Subscriber does not agree with any proposed modifications to this Agreement, the Subscriber may terminate this Agreement in accordance with the Term and Termination clause herein.`}</span>

              <span>{`14.3. To the extent any part or sub-part of this Agreement is held ineffective or invalid by any court of law, you agree that the prior, effective version of this Agreement shall be considered enforceable and valid to the fullest extent.`}</span>
              <span>{`14.4. You agree to routinely monitor this Agreement and refer to the Effective Data posted at the top of this Agreement to note modifications or variations. You further agree to clear Your cache when doing so to avoid accessing a prior version of this Agreement. You agree that Your continued use of Hues after any modifications to this Agreement is a manifestation of Your continued assent to this Agreement.`}</span>
              <span>{`14.5. In the event that You fail to monitor any modifications to or variations of this Agreement, You agree that such failure shall be considered an affirmative waiver of Your right to review the modified Agreement.`}</span>
            </p>
          </div>

          {/* entire agreement */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">15. ENTIRE AGREEMENT</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`This Agreement constitutes the entire understanding between the Parties with respect to any and all use of this Hues. This Agreement supersedes and replaces all prior or contemporaneous Agreements or understandings, written or oral, regarding the use of this Hues.`}</span>
            </p>
          </div>

          {/* no warranties */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">16. NO WARRANTIES</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`16.1. You agree that Your use of Hues and Services is at Your sole and exclusive risk and that any Services provided by Us are on an "As Is" basis. The Provider hereby expressly disclaims any and all express or implied warranties of any kind, including, but not limited to the implied warranty of fitness for a particular purpose and the implied warranty of merchantability.`}</span>
              <span>{` 16.2. The Provider makes no warranties that Hues or Services will meet Your needs or that Hues or Services will be uninterrupted, error-free, or secure. The Provider also makes no warranties as to the reliability or accuracy of any information on Hues or obtained through the Services.`}</span>
              <span>{`16.3. You agree that any damage that may occur to You, through Your computer system, or as a result of the loss of Your data from Your use of Hues or Services is Your sole responsibility, and that the Provider is not liable for any such damage or loss.`}</span>
              <span>{`16.4. All information, software, products, services, and related graphics are provided on Hues is "as" and "as available" basis without warranty of any kind, either expressed or implied.`}</span>
              <span>{`16.5. Hues disclaims all warranties, expressed, or implied including, without limitation, all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement or arising from a course of dealing usage, or trade practice.`}</span>
              <span>{`16.6. The Provider makes no representation about the suitability of the information, tools, add-ons, etc. contained on Hues for any purpose, and the inclusion or offering of any services on Hues does not constitute any endorsement or recommendation of such products or services.`}</span>
              <span>{`16.7. Hues makes no warranty that the use of Hues will be uninterrupted, timely, secure, without defect or error-free. You expressly agree that use of Hues is at your own risk Hues shall not be responsible for any content found on Hues.`}</span>
              <span>{`16.8. Your use of any information or materials on Hues or otherwise obtained through the use of Hues is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any services or information available through Hues meet your specific requirements.`}</span>
              <span>{`16.9. Hues assumes no responsibility for the accuracy, currency, completeness or usefulness of information, views, opinions, or advice in any material contained on Hues. Any information from third parties or advertisers is made available without making any changes and so Hues cannot guarantee accuracy and is not liable for any inconsistencies arising thereof. `}</span>
              <span>{`16.10. All postings, messages, advertisements, photos, sounds, images, text, files, video, or other materials posted on, transmitted through, or linked from Hues, are solely the responsibility of the person from whom such Content originated, and Hues does not control and is not responsible for Content available on Hues.`}</span>
              <span>{`16.11. There may be instances when incorrect information is published inadvertently on Hues or in the Service such as typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, and availability. Any errors, inaccuracies, or omissions may be corrected at Our discretion at any time, and we may change or update information or cancel orders if any information in the Service or on any related Hues is inaccurate at any time without prior notice (including after you have submitted your order).`}</span>
              <span>{`16.12. We undertake no obligation to update, amend or clarify information in the Service or on any related to Hues, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related in the Service or on any related should be taken to indicate that all information has been modified or updated.`}</span>
              <span>{`16.13. Hues shall not be responsible for any interaction between you and the other Subscribers of Hues. Under no circumstances will Hues be liable for any goods, services, resources, or content available through such third-party dealings or communications, or for any harm related thereto. Hues is under no obligation to become involved in any disputes between you and other Subscribers of Hues or between you and any other third parties. You agree to release Hues from any and all claims, demands, and damages arising out of or in connection with such dispute.`}</span>
              <span>{`16.14. You agree and understand that while Hues has made reasonable efforts to safeguard Hues, it cannot and does not ensure or make any representations that Hues or any of the information provided by You cannot be hacked by any unauthorized third parties. You specifically agree that Hues shall not be responsible for unauthorized access to or alteration of Your transmissions or data, any material or data sent or received or not sent or received, or any transactions entered into through Hues.`}</span>
              <span>{`16.15. You hereby agree and confirm that Hues shall not be held liable or responsible in any manner whatsoever for such hacking or any loss or damages suffered by you due to unauthorized access of Hues by third parties or for any such use of the information provided by You or any spam messages or information that You may receive from any such unauthorized third party (including those which are although sent representing the name of Hues but have not been authorized by Hues) which is in violation or contravention of this Agreement or the Privacy Policy.`}</span>
              <span>{`16.16. You specifically agree that Hues is not responsible or liable for any threatening, defamatory, obscene, offensive, or illegal content or conduct of any other party or any infringement of another's rights, including intellectual property rights. You specifically agree that Hues is not responsible for any content sent using and/or included on by any third party.`}</span>
              <span>{`16.17. Hues has no liability and will make no refund in the event of any delay, cancellation, strike, force majeure, or other causes beyond their direct control, and they have no responsibility for any additional expense, omissions, delays or acts of any government or authority.`}</span>
              <span>{`16.18. You will be solely responsible for any damage to your computer system or loss of data that results from the download of any information and/or material. Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you`}</span>
              <span>{`16.19. You accept all responsibility for and hereby agree to indemnify and hold harmless Hues from and against, any actions taken by you or by any person authorized to use your Account, including without limitation, disclosure of passwords to third parties. If you are dissatisfied with Hues, or the Services or any portion thereof, or do not agree with these terms, your only recourse and exclusive remedy shall be to stop using Hues.`}</span>
            </p>
          </div>

          {/* limitations */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">17. LIMITATION OF LIABILITY</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`17.1. In no event shall Hues be liable for any direct, indirect, punitive, incidental, special, consequential damages or any damages whatsoever including, without limitation, damages for loss of use, data or profits, arising out of or in any way connected with the use or performance of Hues with the delay or inability to use Hues or related services, the provision of or failure to provide Services, or to deliver the products or for any information, software, products, services and related graphics obtained through Hues, or any interaction between you and other participants of Hues or otherwise arising out of the use of Hues or any damages resulting from use of or reliance on the information present, whether based on contract, tort, negligence, strict liability or otherwise, even if Hues or any of its affiliates/suppliers has been advised of the possibility of damages. If despite the limitation above, the Company is found liable for any loss or damage which arises out of or in any way connected with the use of Hues and/or provision of Services, then the liability of the Company will in no event exceed`}</span>
              <span>{`The maximum liability of the Provider under this Agreement shall not exceed the Subscription amount paid by the Subscriber for the preceding 3 months.`}</span>
              <span>{`17.2. This aforementioned limitation applies to any and all claims by you, including, but not limited to, lost profits or revenues, consequential or punitive damages, negligence, strict liability, fraud, or torts of any kind.`}</span>
            </p>
          </div>

          {/* general provision */}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">18. GENERAL PROVISIONS</h2>
            <p className="flex flex-col gap-2 pl-4">
              <span>{`18.1. AUTHORITY: Each party represents and warrants to the other that it has full power and authority to enter into this Agreement and that is binding upon such party and enforceable in accordance with its terms. You further warrant and represent that you have the authority to procure your Affiliate's compliance with the terms of this Agreement.`}</span>
              <span>{`18.2. LANGUAGE: This Agreement and all related communications, notices and documentation shall be conducted in the English language. Any translations provided for convenience or informational purposes are not guaranteed to be accurate or complete, and the English version of this Agreement shall prevail in case of any discrepancies or conflicts.`}</span>
              <span>{`18.3. JURISDICTION, VENUE & GOVERNING LAW: Through Your use of Hues or Services, you agree that the laws of India shall govern any matter or dispute relating to or arising out of this Agreement, as well as any dispute of any kind that may arise between You and the Provider, with the exception of its conflict of law provisions. Both the Parties do hereby agree that any dispute arising out of or in relation to this Agreement shall be settled in accordance with the provisions of the Arbitration and Conciliation Act, 1996 and/or any statutory modification or re-enactment thereof for the time being in force. The Parties shall mutually appoint a single Arbitrator. Each Party shall pay their own costs and Fees of the arbitration and the cost of the arbitrator shall be borne equally. The seat or place of the arbitration shall be as follows: Maharashtra. The language of the arbitration shall be: English.  The Agreement shall be governed in accordance with the laws of India and the courts of Maharashtra will have the exclusive jurisdiction.`}</span>

              <span>{`18.4. ASSIGNMENT: The Subscriber shall not assign, transfer, or delegate any rights or obligations under this Agreement without the prior written consent of the Provider. However, the Provider may assign or transfer this Agreement, in whole or in part, to any affiliated entity or in connection with a merger, acquisition, or sale of assets. Any attempted assignment in violation of this clause shall be null and void. This Agreement shall be binding upon and inure to the benefit of the parties and their respective successors and permitted assigns.`}</span>
              <span>{`18.5. SEVERABILITY: If any part or sub-part of this Agreement is held invalid or unenforceable by a court of law or competent arbitrator, the remaining parts and sub-parts will be enforced to the maximum extent possible. The parties agree to replace the severed provision with a valid and enforceable provision that reflects the original intent of the Agreement to the maximum extent possible.`}</span>
              <span>{`18.6. NO WAIVER: The failure of either party to enforce any right or provision of this Agreement shall not be deemed a waiver of such right or provision. The waiver of any breach of this Agreement shall not constitute a waiver of any subsequent breach. No waiver shall be effective unless it is expressly stated in writing and signed by the waiving party.`}</span>
              <span>{`18.7. HEADINGS FOR CONVENIENCE ONLY: Headings of parts and subparts under this Agreement are for convenience and organization, only. Headings shall not affect the meaning of any provisions of this Agreement.`}</span>
              <span>{`18.8. NO AGENCY, PARTNERSHIP OR JOINT VENTURE: Nothing in this Agreement shall be construed as creating an agency, partnership, joint venture, or any other form of legal association between the Subscriber and the Provider. This Agreement does not authorize either party to act as an Agent or representative of the other party.`}</span>
              <span>{`18.9. FORCE MAJEURE: Neither party shall be liable for any failure or delay in the performance of its obligations under this Agreement if such failure or delay is caused by events beyond its reasonable control, including but not limited to acts of God, natural disasters, fires, floods, epidemics, pandemics, war, terrorism, strikes, labour disputes, governmental actions, or any other event that is unforeseeable and beyond the reasonable control of the affected party ("Force Majeure Event"). The party affected by the Force Majeure event shall promptly notify the other party in writing of the occurrence and anticipated duration of such event. The affected party's performance under this Agreement shall be suspended during the Force Majeure Event, and the time for performance shall be extended for a period equal to the duration of the Force Majeure Event. If the Force Majeure Event continues for a period of 30 (thirty) calendar days, either party may terminate this Agreement by providing written notice to the other party without incurring any liability for such termination.`}</span>

              <span>{`18.10. ELECTRONIC COMMUNICATIONS PERMITTED: The parties agree that electronic communications, including but not limited to email, electronic signatures, and online messaging, shall be deemed valid and legally binding for all purposes under this Agreement. Such electronic communication shall have the same force and effect as if they were in writing and signed by the parties. The parties further acknowledge that electronic communications are reliable, confidential, and secure means of communication.`}</span>
              <span>{`You can contact Hues through the following method`}</span>
              <span>{`Support: support@paraphernalia.in`}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button
            size="sm"
            onClick={onAgree} // Call onAgree to update checkbox and close modal
          >
            Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAnsConditionModal;

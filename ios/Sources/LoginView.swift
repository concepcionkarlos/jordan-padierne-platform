import SwiftUI

// Minimal email/password sign-in. Brand-tinted, single screen.
struct LoginView: View {
    @EnvironmentObject private var session: AppSession
    @State private var email = ""
    @State private var password = ""

    private var canSubmit: Bool {
        !email.isEmpty && !password.isEmpty && !session.isWorking
    }

    var body: some View {
        VStack(spacing: 18) {
            Spacer()

            Image(systemName: "house.fill")
                .font(.system(size: 44))
                .foregroundStyle(.tint)
            Text("Jordan CRM")
                .font(.largeTitle.bold())
            Text("Sign in to your CRM")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            VStack(spacing: 12) {
                TextField("Email", text: $email)
                    .textContentType(.username)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding()
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 12))

                SecureField("Password", text: $password)
                    .textContentType(.password)
                    .padding()
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 12))
            }
            .padding(.top, 8)

            if let error = session.errorMessage {
                Text(error)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }

            Button {
                Task { await session.signIn(email: email, password: password) }
            } label: {
                HStack(spacing: 8) {
                    if session.isWorking { ProgressView().tint(.white) }
                    Text("Sign In").bold()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(.tint, in: RoundedRectangle(cornerRadius: 12))
                .foregroundStyle(.white)
                .opacity(canSubmit ? 1 : 0.5)
            }
            .disabled(!canSubmit)

            Spacer()
        }
        .padding(24)
    }
}

#if DEBUG
#Preview {
    LoginView().environmentObject(AppSession(auth: PreviewAuthService()))
}
#endif

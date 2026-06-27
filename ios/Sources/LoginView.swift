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
        VStack(spacing: Space.lg) {
            Spacer()

            Image(systemName: "house.fill")
                .font(.system(size: 44))
                .foregroundStyle(.tint)
            Text("Jordan CRM")
                .font(.largeTitle.bold())
                .foregroundStyle(Brand.navy)
            Text("Sign in to your CRM")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            VStack(spacing: Space.md) {
                TextField("Email", text: $email)
                    .textContentType(.username)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding()
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))

                SecureField("Password", text: $password)
                    .textContentType(.password)
                    .padding()
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
            }
            .padding(.top, Space.sm)

            if let error = session.errorMessage {
                Text(error)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }

            Button {
                Task { await session.signIn(email: email, password: password) }
            } label: {
                HStack(spacing: Space.sm) {
                    if session.isWorking { ProgressView().tint(.white) }
                    Text("Sign In").bold()
                }
                .frame(maxWidth: .infinity)
                .frame(minHeight: Hit.min)
                .padding(.vertical, Space.xs)
                .background(.tint, in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
                .foregroundStyle(.white)
                .opacity(canSubmit ? 1 : 0.5)
            }
            .buttonStyle(PressableStyle())
            .disabled(!canSubmit)

            Spacer()
        }
        .padding(Space.xxl)
    }
}

#if DEBUG
#Preview {
    LoginView().environmentObject(AppSession(auth: PreviewAuthService()))
}
#endif
